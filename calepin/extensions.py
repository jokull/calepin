import os
from flask.ext.sqlalchemy import SQLAlchemy
from redis import from_url as Redis

redis = Redis(os.environ['REDIS_URL'])
db = SQLAlchemy()
