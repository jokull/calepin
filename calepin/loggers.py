import os.path
import logging
from logging.handlers import SMTPHandler, RotatingFileHandler

def configure_logging(app):
    
    mail_handler = SMTPHandler(app.config['MAIL_SERVER'],
        'server-error@calepin.co', app.config['ADMINS'], 'calepin error', 
        credentials=(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD']))
    mail_handler.setLevel(logging.ERROR)
    
    log_root = os.path.abspath(os.path.join(app.root_path, '..', 'logs'))
    if not os.path.isdir(log_root):
        log_root = '/tmp'
    log_dest = os.path.join(log_root, 'calepin')

    file_handler = RotatingFileHandler(log_dest)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.WARNING)

    app.logger.addHandler(file_handler)
    app.logger.addHandler(mail_handler)