from py2neo import Graph, Node, Relationship
from passlib.hash import bcrypt  # encrypt pwd
from flask import Response
from datetime import datetime
import os
import uuid  # generate unique IDs

url = os.environ.get('GRAPHENEDB_URL', 'http://localhost:7474')  # failover to http://localhost:7474
dbuser = 'neo4j'  # os.environ.get('NEO4J_USERNAME')  # neo4j
dbpwd = 'samples'  # os.environ.get('NEO4J_PASSWORD')  # samples

graph = Graph(url + '/db/data/', username = dbuser, password = dbpwd)


# --------------------------
# Sample class
# --------------------------
class Sample:
    def __init__(self, newsample):
        self._id = str(uuid.uuid4())
        self.added = timestamp()
        self.name = newsample.name
        self.creationDate = newsample.creationDate
        self.creator = newsample.creator
        self.isolMethod = newsample.isolMethod
        self.parent = newsample.parent
        self.errors = newsample.errors
        self.volume = newsample.volume
        self.notes = newsample.notes
        self.details = newsample.details
        self.rin = newsample.rin
        self.concBio = newsample.concBio
        self.corrConcBio = newsample.corrConcBio
        self.dilution = newsample.dilution
        self.a280 = newsample.a280
        self.a230 = newsample.a230
        self.concNano = newsample.concNano
        self.yieldBio = newsample.yieldBio
        self.yieldNano = newsample.yieldNano
        

    def register_sample(self):
        newsample = Node(
            'Sample',
            _id = self._id,
            added = self.added,
            name = self.name,
            creationDate = self.creationDate,
            creator = self.creator,
            isolMethod = self.isolMethod,
            parent = self.parent,
            errors = self.errors,
            volume = self.volume,
            notes = self.notes,
            details = self.details,
            rin = self.rin,
            concBio = self.concBio,
            corrConcBio = self.corrConcBio,
            dilution = self.dilution,
            a280 = self.a280,
            a230 = self.a230,
            concNano = self.concNano,
            yieldBio = self.yieldBio,
            yieldNano = self.yieldNano,
        )
        graph.create(newsample)
        return self

    def get_lineage(self):
        # query = '''
        #     MATCH (s:Sample)-[:CHILD_OF*]->(lineage:Sample)
        #     WHERE s.name = {name}
        #     RETURN s, lineage
        # '''
        query = '''
            MATCH (s:Sample)-[:CHILD_OF*]->(lineage:Sample)
            WHERE s.name = {name}
            RETURN s, lineage
        '''
        return graph.run(query, name = self.name)
        # nodes_query = '''
        #     MATCH (a:Person)-[:ACTED_IN]->(:Movie)
        #     RETURN DISTINCT ID(a) AS id, a.name AS name
        # '''
        # edges_query = '''
        #     MATCH (a1:Person)-[:ACTED_IN]->(:Movie)<-[:ACTED_IN]-(a2:Person)
        #     RETURN ID(a1) AS source, ID(a2) AS target
        # '''

    def find(self):
        sample = graph.find_one('Sample', '_id', self._id)  # returns None obj if not found
        return sample


    def generate_sample(self, child):
        if child.find():
            return False
        rel = Relationship(self.find(), 'GENERATED', child)
        graph.create(rel)
        rel = Relationship(child, 'CHILD_OF', self.find())
        graph.create(rel)
        return False

    def is_composed_by(self, parent1, parent2):
        child = self.find()
        rel1 = Relationship(parent1, 'COMPOSE', child)
        graph.create(rel1)
        rel2 = Relationship(parent2, 'COMPOSE', child)
        graph.create(rel2)
        





# --------------------------
# Utility functions
# --------------------------

def get_samples():
    query = '''
        MATCH (s) return s
        WHERE post.date = {today}
        RETURN user.username AS username, post, COLLECT(tag.name) AS tags
        ORDER BY post.timestamp DESC LIMIT 5
    '''
    return graph.run(query, today = date())

def get_all():
    # query = '''
    #     MATCH path = (s)-[r]->(n)
    #     RETURN { sample: s, relations: collect({ type: type(r), target: n }) } AS node
    # '''
    query = '''
        MATCH path = (s)-[r]->(n)
        RETURN s AS sample, s.name AS id, collect({ type: type(r), target: n.name }) AS relations
        ORDER BY sample.name
    '''
    results = graph.data(query)
    nodes = []
    links = []
    for node in results:
        node['sample']['id'] = node['id']
        nodes.append(node['sample'])
        source = node['id']
        for rel in node['relations']:
            links.append({ "source": source, "target": rel['target'], "type": rel['type'] })
    return { "nodes": nodes, "links": links }
    

def timestamp():
    epoch = datetime.utcfromtimestamp(0)
    now = datetime.now()
    delta = now - epoch
    return delta.total_seconds()


def date():
    return datetime.now().strftime('%Y-%m-%d')
