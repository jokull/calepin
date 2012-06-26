Quickstart
==========

    $ cd calepin
    $ virtualenv --distribute venv
    $ source venv/bin/activate
    $ pip install -r requirements
    $ pwd > venv/lib/python2.7/site-packages/app.pth

Environment
-----------

Now add `.env` with the development environment and `source` it. It should include values for the following values:

    SECRET_KEY=
    CALEPIN_ADMIN= # Admin email
    CALEPIN_THEME= # See github.com/jokull/pelican-themes
    CALEPIN_ROOT= # The place where user files are synced and served from
    SQLALCHEMY_DATABASE_URI=postgresql://calepin@/calepin
    DROPBOX_APP_KEY=
    DROPBOX_SECRET=
    SENTRY_DSN= # Optional but good for production
    REDIS_URL = redis://

Components
==========

  + PostgreSQL
  + Redis
  + Flask api and frontend
