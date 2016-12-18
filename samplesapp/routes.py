from samples import Sample, get_samples, get_all
from flask import Flask, request, session, redirect, url_for, render_template, flash

app = Flask(__name__)


# welcome, choose what to do: add, delete or display
@app.route('/')
def index():
    return render_template('index.html')


# add new sample
@app.route('/add', methods = ['GET', 'POST'])
def add():
    if request.method == 'POST':
        details = request.form
        Sample(details).register_sample()
        flash('Success! Your new sample has been saved', 'info')
    return render_template('add.html')


# display the samples graph
@app.route('/display', methods = ['GET', 'POST'])
def display():
    return render_template('display.html', nodes = get_all())




