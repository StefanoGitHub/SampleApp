from samples import Sample, get_samples, get_all
from flask import Flask, request, session, redirect, url_for, render_template, flash

app = Flask(__name__)


# welcome, choose what to do: add, delete or display
@app.route('/')
def home():
    return render_template('home.html')


# add new sample
@app.route('/add', methods = ['GET', 'POST'])
def add():
    if request.method == 'GET':
        # details = request.form
        # Sample(details).register_sample()
        # flash('Success! Your new sample has been saved', 'info')
        sampleid = request.args.get('id', '', type = str)
        # return jsonify(result = a + b)
    elif request.method == 'POST':
        details = request.form
        Sample(details).register_sample()
        flash('Success! Your new sample has been saved', 'info')
        # sampleid = ''
    # else:
        # sampleid = ''
    return render_template('add.html', selected = sampleid )


# display the samples graph
@app.route('/display', methods = ['GET', 'POST'])
def display():
    return render_template('display.html', nodes = get_all())




