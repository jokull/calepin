from flaskext.sqlalchemy import models_committed

from calepin.app import app
from calepin.models import Blog

models_committed.connect(Blog.on_committed, sender=app)
