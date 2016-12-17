from sample import Sample, get_samples, get_all
from flask import Flask, request, session, redirect, url_for, render_template, flash

app = Flask(__name__)


@app.route('/')
def index():
    # posts = get_todays_recent_posts()
    return render_template('index.html')


@app.route('/add', methods = ['GET', 'POST'])
def add():
    if request.method == 'POST':
        details = request.form
        Sample(details).register_sample()
        flash('Success! Your new sample has been saved', 'info')
    return render_template('add.html')


@app.route('/display', methods = ['GET', 'POST'])
def display():
    # if request.method == 'POST':
    #     details = request.form
    #     flash('Success! Your new sample has been saved', 'info')
    
    nodes = [
        dict(name = "Parent"),
        dict(name = "child1"),
        dict(name = "child2", target = [0]),
        dict(name = "child3", target = [0]),
        dict(name = "child4", target = [1]),
        dict(name = "child5", target = [0, 1, 2, 3])
    ]
    
    return render_template('display.html', nodes = get_all())



