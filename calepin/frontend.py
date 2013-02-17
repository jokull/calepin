import os.path

from flask import (
    Blueprint, jsonify, g, url_for, request, session, current_app,
    render_template, redirect, abort, flash
)
from flask.ext.login import login_user, current_user

from dropbox.rest import ErrorResponse

from .models import Blog
from .extensions import db


frontend = Blueprint('frontend', __name__)


def context():
    deploy = os.path.join(os.path.dirname(__file__), 'deploy')
    if os.path.exists(deploy):
        return dict(revision=''.join(file(deploy).read().splitlines()).strip())
    return {}


def get_authorize_url(callback_args={}):
    # Username is stored in oauth callback as url arg

    request_token = g.dropbox.obtain_request_token()
    session.update(
        request_token_key=request_token.key,
        request_token_secret=request_token.secret,
    )

    callback_args.update(_external=True)
    callback = url_for('frontend.oauth_callback', **callback_args)
    return g.dropbox.build_authorize_url(request_token, callback)


@frontend.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    if not username:
        abort(403)
    return jsonify(redirect=get_authorize_url({'username': username}))


@frontend.route('/login', methods=['POST'])
def login():
    return jsonify(redirect=get_authorize_url())


@frontend.route('/authorize/callback')
def oauth_callback():

    try:
        g.dropbox.set_request_token(
            session['request_token_key'],
            session['request_token_secret'])
    except KeyError:
        message = u'Could not find request_token for Dropbox OAuth to complete'
        return message, 403, {}

    try:
        g.dropbox.obtain_access_token()
    except ErrorResponse, e:
        current_app.logger.warning(str(e))
        return redirect(url_for('frontend.site'), 301)

    access_token = u'|'.join([g.dropbox.token.key, g.dropbox.token.secret])

    id = request.args.get('uid')
    blog = Blog.query.get(id)

    username = request.args.get('username')

    if username is None:
        # The user logged in without choosing a username
        flash(u"Please pick a username to reserve your site url")
        return redirect(url_for('frontend.site'))

    other_blog = Blog.query.filter_by(username=username).first()
    if other_blog and other_blog.id != id:
        flash(u'A user is already using the username %s' % username)
        return redirect(url_for('frontend.site'))

    if blog is None:  # New user
        blog = Blog(id=id, username=username)

    if blog.username is None:
        blog.username = username

    blog.access_token = access_token
    db.session.add(blog)
    db.session.commit()

    if not login_user(blog, remember=True):
        abort(403, u'Inactive user')

    return redirect(url_for('frontend.site'), 301)


@frontend.route('/profile')
def profile():
    return site()


@frontend.route('/')
def site(route=None):
    return render_template('site.html',
        js=dict(
            urls=dict((r.endpoint, r.rule) for r in current_app.url_map.iter_rules()),
            route=request.path[1:],
            blog=current_user.json,
        )
    )


@frontend.route('/havoc', methods=['DELETE', 'PUT', 'GET', 'POST'])
def havoc():
    1 / 0


@frontend.route('/roster')
def roster():
    return render_template('roster.html',
        blogs=Blog.query.order_by(Blog.username).all())
