import os, shutil, logging, unicodedata

from flask import (Blueprint, jsonify, g, url_for, request, 
                   session, current_app, redirect, abort)
from flask_login import (login_required, login_user, 
                            logout_user, current_user)

from dropbox.rest import ErrorResponse

from .models import Blog, db
from .forms import BlogForm


api = Blueprint('api', __name__)

@api.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify()


@api.route('/account/dropbox')
@login_required
def dropbox_profile():
    return jsonify(**current_user.dropbox.account_info())
    

@api.route('/availability', methods=['POST'])
def availability():
    username = request.form.get('username').lower()
    return jsonify(available=Blog.is_available(username))


@api.route('/blog', methods=['POST'])
@login_required
def blog_add():
    blog = current_user
    form = BlogForm(initial=blog.json)
    if form.validate(request.json, False):
        blog.update(**form.data)
        db.session.add(blog); db.session.commit()
    return jsonify(errors=form.errors, **blog.json)


@api.route('/blog/<id>', methods=['PUT'])
@login_required
def blog_edit(id):
    blog = current_user
    if id != blog.id:
        abort(403)
    form = BlogForm(initial=blog.json)
    if form.validate(request.json, False):
        blog.update(**form.data)
        account_info = blog.dropbox.account_info()
        blog.email = account_info.get('email')
        db.session.add(blog); db.session.commit()
    return jsonify(errors=form.errors, **blog.json)


@api.route('/blog/<id>', methods=['GET'])
@login_required
def blog(id):
    return jsonify(**current_user.json)


@api.route('/blog/<id>', methods=['DELETE'])
@login_required
def blog_delete(id):
    blog = current_user
    if id != blog.id:
        abort(403)
    db.session.delete(blog)
    db.session.commit()
    logout_user()
    return jsonify()


@api.route('/blog/<id>/pelican', methods=['POST'])
@login_required
def publish(id):
    if current_user.id != id:
        abort(403)
        
    pelican = current_user.pelican
    if not os.path.exists(pelican.path):
        os.makedirs(pelican.path)
    
    DROPBOX_ROOT = u'/'
    server_files = {}
    for f in current_user.dropbox.metadata(DROPBOX_ROOT, list=True)['contents']:
        filename = os.path.relpath(f['path'], DROPBOX_ROOT)
        # We don't want .zip and other unwanted files, just calepin goodstuff
        if filename.endswith(current_app.config.get('CALEPIN_ALLOW_EXTENSIONS')):
            server_files[filename] = f
    
    report = dict(
        add=0,
        edit=0,
        delete=0,
        skip=0,
    )
    
    KEY = u"calepin:%s:%s" # Redis key with revision number
    
    # Remove files no longer in Dropbox
    for filename in os.listdir(pelican.path):
        filename = unicodedata.normalize('NFKC', filename)
        if not filename in server_files:
            try:
                os.remove(os.path.join(pelican.path, filename))
                g.redis.delete(KEY % (current_user.id, filename))
                report['delete'] += 1
            except UnicodeDecodeError:
                current_app.logger.warning(u"Could not remove post %s / %s" % (type(pelican.path), type(filename)))
                continue
    
    # SYNC FROM SERVER
    
    for path, meta in server_files.items():
        
        _report_key = 'edit'
        
        local_path = os.path.join(pelican.path, path)
        
        _key = KEY % (current_user.id, path)
        local_rev = g.redis.get(_key)
            
        if meta["rev"] == local_rev:
            if os.path.exists(local_path):
                continue

        if local_rev is None:
            _report_key = 'add' 
            
        try:
            req = current_user.dropbox.get_file(meta['path'])
        except ErrorResponse, e:
            # 404 in dropbox, Why?
            current_app.logger.warning(str(e))
            report['skip'] += 1
            continue
            
        with pelican.get_file_pointer(path, 'w') as fp:
            fp.write(req.read())
        
        g.redis.set(_key, meta["rev"])
        req.close()
        
        report[_report_key] += 1
    
    current_user.pelican.run()
    
    return jsonify(**report)
    

