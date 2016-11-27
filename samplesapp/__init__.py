from .views import app
from .models import graph

# -----------
# flask_assets
# http://flask-assets.readthedocs.io/en/latest/#flask_assets.Environment
# example project
# http://maximebf.com/blog/2012/10/building-websites-in-python-with-flask/#.WDowuKIrLMI
# https://github.com/trtg/flask_assets_tutorial/tree/master/example/static/css
# -----------
# from flask_assets import Environment
# from webassets.loaders import PythonLoader as PythonAssetsLoader
# import assets
#
# assets_env = Environment(app)
# assets_loader = PythonAssetsLoader(assets)
# for name, bundle in assets_loader.load_bundles().iteritems():
#     assets_env.register(name, bundle)


# graph.schema.create_uniqueness_constraint("User", "username")
# graph.schema.create_uniqueness_constraint("Tag", "name")
# graph.schema.create_uniqueness_constraint("Post", "id")
