from samplesapp import app
import os

app.run(debug = True)

# -------------------
# to run on Heroku
#   - create project:
#       $ heroku
#   - install the GrapheneDB add-on:
#       $ heroku addons:add graphenedb:chalk
#   - create Procfile with "web: python run.py"
# -------------------
# app.secret_key = os.urandom(24)
# port = int(os.environ.get('PORT', 5000))  # get PORT from Heroku server
# app.run(host='0.0.0.0', port=port, debug = True)

