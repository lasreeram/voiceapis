from flask import Flask, render_template, request, url_for
app_new = Flask(__name__)

posts = [
	{
		'author': 'Sreeram',
		'title': 'my new book',
		'content': 'First post content',
		'date': 'April 20, 2018',	
	},
	{
		'author': 'Vrinda',
		'title': 'Her new book 1',
		'content': 'First post content',
		'date': 'July 20, 2018',
	}

]

@app_new.route('/')
@app_new.route('/home')
def home_page():
    return render_template('home.html', posts=posts)

@app_new.route('/about')
def about_page():
    return render_template('about.html', title='About Page')

if( __name__ == '__main__'):
	app_new.run(debug=True)
