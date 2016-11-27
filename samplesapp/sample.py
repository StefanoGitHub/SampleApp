from py2neo import Graph, Node, Relationship
from passlib.hash import bcrypt  # encrypt pwd
from datetime import datetime
import os
import uuid  # generate unique IDs

url = os.environ.get('GRAPHENEDB_URL', 'http://localhost:7474')  # failover to http://localhost:7474
dbuser = 'neo4j'  # os.environ.get('NEO4J_USERNAME')  # neo4j
dbpwd = 'samples'  # os.environ.get('NEO4J_PASSWORD')  # samples

graph = Graph(url + '/db/data/', username = dbuser, password = dbpwd)


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
        self.nanoDrop = newsample.nanoDrop
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
            nanoDrop = self.nanoDrop,
            yieldBio = self.yieldBio,
            yieldNano = self.yieldNano,
        )
        graph.create(newsample)
        return self


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
        
        
        

    def get_recent_posts(self):
        query = '''
            MATCH (user:User)-[:PUBLISHED]->(post:Post)<-[:TAGGED]-(tag:Tag)
            WHERE user.username = {username}
            RETURN post, COLLECT(tag.name) AS tags
            ORDER BY post.timestamp DESC LIMIT 5
        '''
        return graph.run(query, username = self.username)

    def get_similar_users(self):
        # Find three users who are most similar to the logged-in user
        # based on tags they've both blogged about.
        query = '''
            MATCH (you:User)-[:PUBLISHED]->(:Post)<-[:TAGGED]-(tag:Tag),
                  (they:User)-[:PUBLISHED]->(:Post)<-[:TAGGED]-(tag)
            WHERE you.username = {username} AND you <> they
            WITH they, COLLECT(DISTINCT tag.name) AS tags
            ORDER BY SIZE(tags) DESC LIMIT 3
            RETURN they.username AS similar_user, tags
        '''
        return graph.run(query, username = self.username)

    def get_commonality_of_user(self, other):
        # Find how many of the logged-in user's posts the other user
        # has liked and which tags they've both blogged about.
        query = '''
            MATCH (they:User {username: {they} })
            MATCH (you:User {username: {you} })
            OPTIONAL MATCH (they)-[:PUBLISHED]->(:Post)<-[:TAGGED]-(tag:Tag),
                           (you)-[:PUBLISHED]->(:Post)<-[:TAGGED]-(tag)
            RETURN SIZE((they)-[:LIKED]->(:Post)<-[:PUBLISHED]-(you)) AS likes,
                   COLLECT(DISTINCT tag.name) AS tags
        '''
        return graph.run(query, they = other.username, you = self.username).next





# --------------------------
# Utility functions
# --------------------------

def get_todays_recent_posts():
    query = '''
        MATCH (user:User)-[:PUBLISHED]->(post:Post)<-[:TAGGED]-(tag:Tag)
        WHERE post.date = {today}
        RETURN user.username AS username, post, COLLECT(tag.name) AS tags
        ORDER BY post.timestamp DESC LIMIT 5
    '''
    return graph.run(query, today = date())


def timestamp():
    epoch = datetime.utcfromtimestamp(0)
    now = datetime.now()
    delta = now - epoch
    return delta.total_seconds()


def date():
    return datetime.now().strftime('%Y-%m-%d')
