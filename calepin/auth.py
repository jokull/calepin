# encoding=utf-8

from flask_login import LoginManager, AnonymousUser
from calepin.models import Blog

login_manager = LoginManager()

AnonymousUser.json = {}

login_manager.anonymous_user = AnonymousUser
login_manager.login_view = "frontend.site"


@login_manager.user_loader
def get_user(id):
    return Blog.query.get(id)
