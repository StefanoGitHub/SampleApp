from samples import Sample, get_all
from flask import Flask, request, session, redirect, url_for, render_template, flash

app = Flask(__name__)


# welcome, choose what to do: add, delete or display
@app.route('/')
def home():
    return render_template('home.html')


# add new sample
@app.route('/add', methods = ['GET', 'POST'])
def add():
    sample_id = ''
    if request.method == 'GET':
        # details = request.form
        # Sample(details).register_sample()
        # flash('Success! Your new sample has been saved', 'info')
        sample_id = request.args.get('id', '', type = str)
        # return jsonify(result = a + b)
    elif request.method == 'POST':
        details = request.form
        Sample(details).save_sample()
        flash('Success! Your new sample has been saved', 'info')
    return render_template('add.html', selected = sample_id )


# display the samples graph
@app.route('/display', methods = ['GET', 'POST'])
def display():
    nodes = get_all()
    return render_template('display.html', nodes = nodes)

# display the lineage graph
@app.route('/lineage')
def lineage():
    # if request.method == 'GET':
    sample_id = request.args.get('id', '', type = str)
    if not sample_id:
        return render_template('home.html')
    nodes = Sample(sample_id).get_lineage()
    # if len(nodes) == 0:
    #     flash('No ')
    
    return render_template('lineage.html', nodes = nodes)




