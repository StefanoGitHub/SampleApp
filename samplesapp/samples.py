from py2neo import Graph, Node, Relationship
from passlib.hash import bcrypt  # encrypt pwd
from flask import Response
import json
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
    """ Represents a Sample object saved in the DB
    implements the methods to interact with the DB
    """
    
    def __init__(self, sampleid):
        """ Create Sample object """
        self.id = sampleid

    def find(self):
        """ Finds the (current) sample in the DB; returns the Sample or None if not found"""
        sample = graph.find_one('Sample', 'id', self.id)  # returns None obj if not found
        return sample

    def save_sample(self, sample_data):
        """ Saves the passed data as a new sample in the DB """
        if self.find() is not None:
            new_sample = Node(
                'Sample',
                # _id = str(uuid.uuid4()),
                id = sample_data.id,
                added = timestamp(),
                name = sample_data.name,
                creationDate = sample_data.creationDate,
                creator = sample_data.creator,
                isolMethod = sample_data.isolMethod,
                parent = sample_data.parent,
                source = sample_data.source,
                type = sample_data.type,
                errors = sample_data.errors,
                volume = sample_data.volume,
                notes = sample_data.notes,
                details = sample_data.details,
                rin = sample_data.rin,
                concBio = sample_data.concBio,
                corrConcBio = sample_data.corrConcBio,
                dilution = sample_data.dilution,
                a280 = sample_data.a280,
                a230 = sample_data.a230,
                concNano = sample_data.concNano,
                yieldBio = sample_data.yieldBio,
                yieldNano = sample_data.yieldNano,
            )
            graph.create(new_sample)
            return True
        else:
            return False

    def get_lineage(self):
        """ Returns the set of nodes and links composing the lineage of the current (self) Sample;
            The links array lists the connections source-target between two nodes, where the numbers correspond
            to the index of the node in the nodes list
            example:
              "links": [
                { "source":0, "target":14, "type":"GENERATED" },
                { "source":0, "target":13, "type":"GENERATED" },
                { "source":0, "target":1,  "type":"GENERATED" },
                ...
              ],
              "nodes": [
                { "id":"A", "name":"A" },
                { "id":"B", "name":"B" },
                { "id":"C", "name":"C" },
                ...
              ]
        """
        # query = '''
        #     MATCH (s:Sample)-[:CHILD_OF*]->(lineage:Sample)
        #     WHERE s.name = {name}
        #     RETURN s, lineage
        # '''
        query = '''
            MATCH (sample:Sample {name:{id}})
            OPTIONAL MATCH (t:Sample {name:{id}})-[:CHILD_OF*]->(parent:Sample)
            OPTIONAL MATCH (parent)-[r_out]->(child)-[r_in]->(parent)
            RETURN
                sample,
                collect({ source: parent, type: type(r_out), target: child }) AS rel_out,
                collect({ source: child, type: type(r_in), target: parent }) AS rel_in;
        '''
        result = graph.data(query, id = self.id)
        nodes = []
        links = []
        for node in result:
            node['sample']['id'] = node['id']
            nodes.append(node['sample'])
            source = node['id']
            for rel in node['relations']:
                links.append({ "source": source, "target": rel['target'], "type": rel['type'] })
        return { "nodes": nodes, "links": links }





    # def generate_sample(self, child):
    #     if child.find():
    #         return False
    #     rel = Relationship(self.find(), 'GENERATED', child)
    #     graph.create(rel)
    #     rel = Relationship(child, 'CHILD_OF', self.find())
    #     graph.create(rel)
    #     return False

    def is_composed_by(self, parent1, parent2):
        child = self.find()
        rel1 = Relationship(parent1, 'COMPOSE', child)
        graph.create(rel1)
        rel2 = Relationship(parent2, 'COMPOSE', child)
        graph.create(rel2)
        





# --------------------------
# Utility functions
# --------------------------

# def get_samples():
#     query = '''
#         MATCH (s) return s
#         WHERE post.date = {today}
#         RETURN user.username AS username, post, COLLECT(tag.name) AS tags
#         ORDER BY post.timestamp DESC LIMIT 5
#     '''
#     return graph.run(query, today = date())

def get_all():
    query = '''
        MATCH (s)-[r]->(n)
        RETURN s AS sample, s.name AS id, collect({ type: type(r), target: n.name }) AS relations
        ORDER BY sample.name
    '''
    """ for now there is only the name property in each node, later will refer to them with the id"""
    # query = '''
    #     MATCH path = (s)-[r]->(n)
    #     RETURN
    #       s AS sample, s.id AS id,
    #       collect({ type: type(r), target: n.id }) AS relations
    #     ORDER BY sample.id
    # '''
    result = graph.data(query)
    nodes = []
    links = []
    for node in result:
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
