import os
import hashlib
import mistune

from flask import Flask, url_for, request

from config import config


def register_extensions(app):
    from .extensions import db, login_manager
    db.init_app(app)
    login_manager.init_app(app)

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    register_extensions(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    @app.template_filter('strftime')
    def format_datatime(value, format='%b %d, %Y'):
        return value.strftime(format)

    @app.template_filter('markdown')
    def render_markdown(content):
        renderer = mistune.Renderer(hard_wrap=True)
        markdown = mistune.Markdown(renderer=renderer)
        return markdown(content)

    @app.template_filter('gravatar')
    def gravatar_url(email, size=100, default='identicon', rating='g'):
        url = 'https://www.gravatar.com/avatar'
        hash = '' if email is None else hashlib.md5(email.encode('utf-8').lower()).hexdigest()
        return '{url}/{hash}?s={size}&d={default}&r={rating}'.format(
            url=url, hash=hash, size=size, default=default, rating=rating)

    @app.context_processor
    def hash_processor():
        def hashed_url(filepath):
            import re
            directory, filename = filepath.rsplit('/')
            name, extension = filename.rsplit('.')
            folder = os.path.join(app.root_path, 'static', directory)
            files = os.listdir(folder)
            for f in files:
                regex = name + "\.[a-z0-9]+\." + extension
                if re.match(regex, f):
                    return os.path.join('/static', directory, f).replace('\\', '/')
            return os.path.join('/static', filepath).replace('\\', '/')
        return dict(hashed_url=hashed_url)

    app.jinja_env.globals['ANALYTICS_ID'] = config[config_name].ANALYTICS_ID

    return app
