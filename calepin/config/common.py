import os

MAIL_SERVER = 'smtp.sendgrid.net'
MAIL_USERNAME = ''
MAIL_PASSWORD = ''
DEFAULT_MAIL_SENDER = ''

ADMINS = MANAGERS = ['admin@calepin.co']
ASSETS_DEBUG = DEBUG = SQLALCHEMY_ECHO = False

CALEPIN_ALLOW_EXTENSIONS = (u'.md', u'.json', u'.rst', u'html')

SECRET_KEY = 'developer-key'

SQLALCHEMY_DATABASE_URI = 'postgresql://calepin@/calepin'

EXCEPTIONAL_API_KEY = ''

DROPBOX_API = ('key', 'secret')