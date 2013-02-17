# encoding=utf-8

import os.path
import json

from bunch import Bunch

from flask import current_app

from pelican import Pelican
from pelican.settings import _DEFAULT_CONFIG


class Calepin(Pelican):

    USER_CONFIG_PROPERTIES = (
        'AUTHOR',
        'DEFAULT_DATE_FORMAT',
        'GOOGLE_ANALYTICS',
        'GAUGE_ID',
        'CLICKY',
        'DEFAULT_PAGINATION',
        'WITH_FUTURE_DATES',
        'OUTPUT_SOURCES',
        'TIMEZONE',
    )

    def __init__(self, blog):
        self.blog = blog
        self._config = Bunch(current_app.config)
        self.delete_outputdir = True
        self.settings = dict(_DEFAULT_CONFIG,
            SITENAME=self.blog.sitename,
            AUTHOR=self.blog.sitename,
            FALLBACK_ON_FS_DATE=False,
            DEFAULT_DATE_FORMAT='%B %e, %Y',
            OUTPUT_SOURCES=True,
            DEFAULT_PAGINATION=False,
            TWITTER=self.blog.twitter,
            DISQUS_SITENAME=self.blog.disqus)

        self.settings.update(self.user_config)
        self.markup = self.settings['MARKUP']

    def build_path(self, *path):
        root = self._config.CALEPIN_ROOT
        return os.path.realpath(os.path.join(root, *path))

    @property
    def output_path(self):
        return self.build_path(u'output', self.blog.username)

    @property
    def path(self):
        return self.build_path(u'posts', self.blog.username)

    @property
    def theme(self):
        return self._config.CALEPIN_THEME

    def get_file_pointer(self, filename, mode='r'):
        if filename.startswith(u'/'):
            filename = filename[1:]
        path = os.path.join(self.path, filename)
        return open(path.encode('utf-8'), mode)

    @property
    def user_config(self):
        # settings.json comes from the user so we must not trust it completely
        # Config parameters are from whitelist and values must be strings or booleans
        try:
            config = json.load(self.get_file_pointer('settings.json'))
            assert isinstance(config, dict)
            return {k.upper(): config[k] for k, v in \
                config.items() if \
                k.upper() in self.USER_CONFIG_PROPERTIES and \
                isinstance(config[k], (basestring, int))}
        except (AssertionError, IOError, ValueError):
            return {}
