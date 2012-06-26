# encoding=utf-8

import os, json, shutil, base64

from sqlalchemy.orm.attributes import get_history

from flask import g, url_for, current_app
from flask_login import current_user
from flask_sqlalchemy import SQLAlchemy

from dropbox.client import DropboxClient

from .classtools import cached_property
from .blog import Calepin

db = SQLAlchemy()


RESERVED_SLUGS = ['www', 'calepin', 'static', 'support', 'mail', '']

def _make_partner_token():
    return base64.urlsafe_b64encode(os.urandom(20))[:-2]


class Blog(db.Model):
    """
    Workouts are tied to Blog
    """
    
    lowercase_properties = ('username', 'twitter', 'cname', 'email')
    
    # URL
    username = db.Column(db.String(255), nullable=True, unique=True, index=True)
    
    # THEME directory
    theme = db.Column(db.String, nullable=True)
    
    # PELICAN settings
    sitename = db.Column(db.String, nullable=True)
    disqus = db.Column(db.String, nullable=True)
    twitter = db.Column(db.String, nullable=True)
    
    # OTHER SETTINGS
    email = db.Column(db.String, nullable=True)
    cname = db.Column(db.String, nullable=True, index=True)
    
    # DROPBOX
    id = db.Column(db.String, primary_key=True)
    access_token = db.Column(db.String)
    
    @property
    def json(self):
        return dict(id=self.id,
                    url=self.get_url(),
                    site_url=self.get_site_url(),
                    cname=self.cname,
                    sitename=self.sitename,
                    username=self.username,
                    disqus=self.disqus,
                    twitter=self.twitter,
                    valid=self.validate())
    
    def update(self, **kwargs):
        for key, value in kwargs.items():
            if key in self.lowercase_properties:
                value = value.lower()
            setattr(self, key, value)
        # See if username is updated
        added, unchanged, deleted = get_history(self, 'username')
        # Username is updated - if new spot is available move to there
        if unchanged:
            return
        old_username = deleted[0]
        if old_username: 
            self.update_paths(old_username)
    
    def update_paths(self, username_old):
        for new_path in [self.pelican.path, self.pelican.output_path]:
            root = new_path.rsplit(self.username, 1)[0]
            old_path = os.path.join(root, username_old)
            if not os.path.isdir(old_path):
                current_app.logger.warning(u"Tried to move from %s to %s but no source folder existed" % (old_path, new_path))
                continue
            if os.path.isdir(new_path):
                shutil.rmtree(new_path)
            try:
                os.rename(old_path, new_path)
            except IOError:
                current_app.error.warning(u'User wanted new username, got it, but could not move from %s to %s' % (old_path, new_path))
        
    
    def validate(self):
        return bool(self.username and self.sitename)
    
    def get_site_url(self):
        if self.cname:
            return 'http://%s' % self.cname
        return 'http://%s.calepin.co' % self.username
    
    def get_url(self):
        return url_for('api.blog', id=self.id)
    
    @property
    def pelican(self):
        return Calepin(blog=self)
    
    @cached_property
    def dropbox(self):
        g.dropbox.set_token(*self.access_token.split('|'))
        return DropboxClient(g.dropbox)
    
    @cached_property
    def post_count(self):
        return len(g.redis.keys('calepin:%s:*' % self.id))
    
    """
    Methods Flask-Login expects
    """
    
    def is_authenticated(self):
        return True
    
    def is_active(self):
        return True
    
    def is_anonymous(self):
        return False
    
    def get_id(self):
        return unicode(self.id)
    
    @classmethod
    def is_available(cls, username):
        blog = cls.query.filter_by(username=username).first()
        available = blog is None
        if current_user.is_active() and not available:
            # It's available if the user asking owns it
            available = current_user.id == blog.id 
        # But not if it's been added to reserved list
        return available and not username in RESERVED_SLUGS
    
    @classmethod
    def on_committed(cls, sender, changes):
        for model, change in changes:
            if not isinstance(model, cls):
                continue
            if change == "insert":
                with sender.open_resource('skeleton/my-first-post.md') as fp:
                    model.dropbox.put_file('my-first-post.md', fp)
                model.dropbox.put_file('.partner-token', _make_partner_token(), overwrite=True)
            elif change == "update":
                pass # TODO rescan posts for search index
            elif change == "delete":
                for path in [model.pelican.output_path,
                             model.pelican.path]:
                    if os.path.exists(path):
                        shutil.rmtree(path)
            



