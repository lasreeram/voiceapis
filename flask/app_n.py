from flask import Flask, render_template, request
app = Flask(__name__)

posts = [
	{
		'author': 'Sreeram',
		'title': 'my book',
		'content': 'First post content',
		'date': 'April 20, 2018',	
	},
	{
		'author': 'Vrinda',
		'title': 'Her book 1',
		'content': 'First post content',
		'date': 'July 20, 2018',
	}

]

@app.route('/')
@app.route('/home')
def home_page():
    return render_template('home.html', posts=posts)

@app.route('/about')
def about_page():
    return render_template('about.html')

if( __name__ == '__main__'):
	app.run(debug=True)