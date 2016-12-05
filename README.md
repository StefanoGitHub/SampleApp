# neo4j-flask
A microblog application written in Python powered by Flask and Neo4j. Extension of Flask's microblog tutorial, [Flaskr](http://flask.pocoo.org/docs/0.10/tutorial/).

see [http://nicolewhite.github.io/neo4j-flask/index.html](http://nicolewhite.github.io/neo4j-flask/index.html)

## Usage

Make sure Neo4j is running first!

**If you're on Neo4j >= 2.2, make sure to set environment variables `NEO4J_USERNAME` and `NEO4J_PASSWORD`
to your username and password, respectively:**

```
$ export NEO4J_USERNAME=neo4j
$ export NEO4J_PASSWORD=samples
```

Or, set `dbms.security.auth_enabled=false` in `conf/neo4j-server.properties`.

Then:

```
git clone https://github.com/nicolewhite/neo4j-flask.git
cd SampleApp
pip install virtualenv
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

The app will be running on [http://localhost:5000](http://localhost:5000)
(Press `CTRL+C` to quit)


Start:
```
source venv/bin/activate
python run.py

```

Data example + info
[https://www.lucidchart.com/documents/edit/10285c27-5c46-4f74-8b81-aa0c926dd3f7?shared=true&](https://www.lucidchart.com/documents/edit/10285c27-5c46-4f74-8b81-aa0c926dd3f7?shared=true&)

