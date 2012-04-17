# encoding=utf-8

import os

from redis import Redis
from dropbox.session import DropboxSession
from dropbox.rest import ErrorResponse

from flask import (Flask, request, g, url_for, redirect, 
    render_template)
from flaskext.exceptional import Exceptional

app = Flask(__name__)
app.config.from_object('calepin.config.%s' % os.environ.get('CALEPIN_CONFIG', 'production'))


exceptional = Exceptional(app)


if not app.debug:
    from calepin.loggers import configure_logging
    configure_logging(app)
    

@app.before_request
def connect_services():
    key, secret = app.config['DROPBOX_API']
    g.dropbox = DropboxSession(key, secret, 'app_folder')
    g.redis = Redis(host='localhost', port=6379, db=0)

from calepin.models import Blog, db
db.init_app(app)

from calepin.signals import *

from calepin.auth import login_manager
login_manager.setup_app(app)


from calepin.api import api
from calepin.frontend import frontend, context

app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(frontend)

app.context_processor(context)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(ErrorResponse)
def dropbox_api_error(error):
    app.logger.warning(str(error))
    return redirect(url_for('frontend.site'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6444, debug=True)

