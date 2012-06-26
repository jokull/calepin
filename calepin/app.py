# encoding=utf-8

import os

from redis import from_url as Redis
from dropbox.session import DropboxSession
from dropbox.rest import ErrorResponse

from flask import (Flask, request, g, url_for, redirect, 
    render_template)

from calepin.config import *

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.config.update(DEBUG=os.environ.get('DEBUG') == 'true')

if 'SENTRY_DSN' in os.environ:
    app.config['SENTRY_DSN'] = os.environ['SENTRY_DSN']    
    from raven.contrib.flask import Sentry
    sentry = Sentry(app)

redis = Redis(app.config['REDIS_URL'])

@app.before_request
def connect_services():
    g.dropbox = DropboxSession(app.config['DROPBOX_APP_KEY'], 
                               app.config['DROPBOX_SECRET'], 'app_folder')

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
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 6444)), debug=True)

