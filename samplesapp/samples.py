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
                { "source":"A", "target":"B", "type":"GENERATED" },
                { "source":"B", "target":"I", "type":"CHILD_OF" },
                { "source":"N", "target":"H",  "type":"GENERATED" },
                ...
              ],
              "nodes": [
                { "id":"1", "name":"A" },
                { "id":"2", "name":"B" },
                { "id":"3", "name":"C" },
                ...
              ]
        """
        query = '''
            MATCH lineage = (child:Sample {name:{id}})-[:CHILD_OF*]->(parent:Sample)
            MATCH (n:Sample)-[r_out]->(m:Sample)-[r_in]->(n:Sample)
                WHERE n IN nodes(lineage) AND m IN nodes(lineage)
            RETURN
                child + collect(DISTINCT parent) AS nodes,
                collect(DISTINCT {source: n.name, rel: type(r_out), target: m.name}) +
                collect(DISTINCT {source: m.name, rel: type(r_in), target: n.name}) AS links
        '''
        result = graph.data(query, id = self.id)
        links = []
        if not result:  # no nodes
            query = 'MATCH (n:Sample {name:{id}}) RETURN n AS nodes'
            result = graph.data(query, id = self.id)[0]  # just the target sample
            nodes = [result['nodes']]
        else:
            node_list = {}
            data = result[0]
            nodes = data['nodes']
            for idx, node in enumerate(nodes):
                node_list[node['name']] = idx
                if node['name'] == self.id:
                    node['target'] = True
            for link in data['links']:
                source = link['source']
                target = link['target']
                links.append({ "source": node_list[source], "target": node_list[target], "type": link['rel'] })
                    
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

def get_all():
    query = '''
        MATCH (s:Sample)-[r]->(n:Sample)
        RETURN
            collect(DISTINCT s) AS nodes,
            collect({ source: s.name, rel: type(r), target: n.name }) AS links
    '''
    result = graph.data(query)
    node_list = {}
    data = result[0]
    nodes = data['nodes']
    links = []
    for idx, node in enumerate(nodes):
        node_list[node['name']] = idx
    for link in data['links']:
        source = link['source']
        target = link['target']
        links.append({ "source": node_list[source], "target": node_list[target], "type": link['rel'] })
    return { "nodes": nodes, "links": links }
    

def timestamp():
    epoch = datetime.utcfromtimestamp(0)
    now = datetime.now()
    delta = now - epoch
    return delta.total_seconds()


def date():
    return datetime.now().strftime('%Y-%m-%d')
