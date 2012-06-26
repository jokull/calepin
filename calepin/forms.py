# encoding=utf-8

import re, json

from flask import current_app
from flask_login import current_user

from fungiform.forms import ValidationError
from flaskext.fungiform import Form, TextField, BooleanField

from .models import Blog


class BlogForm(Form):
    
    csrf_protected = False
    
    username = TextField(u"Username", required=True)
    sitename = TextField(u"Site name or Author", required=True)
    disqus = TextField(u"Disqus username", required=False)
    twitter = TextField(u"Twitter name", required=False)
    cname = TextField(u"CNAME", required=False)
    
    def validate_username(self, value):
        if not Blog.is_available(value.lower()):
            message = u'This username is taken by someone else'
            raise ValidationError(message)
    
    def validate_twitter(self, value):
        if not re.match(r'@?[a-z0-9_]+', value.lower()):
            message = u'Twitter name is not valid'
            raise ValidationError(message)
