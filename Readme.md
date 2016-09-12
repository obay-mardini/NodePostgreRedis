# User Registration System and Scrolling news-ticker

#Technologies:
  * Javascript
  * Node JS
  * Redis
  * PostgreSQL
  * HTML
  * CSS
  * Jquery
  * Express
  * Session-express
  * handlebars

# Tasks:
  * create a server and listen on port 8080
  * Create a static HTML page named name.html that contains a form of the user's name and lastName, then submit this form and add it to your PostgreSQL database.
  * set cookies for the entered data to be remembered across the requests.
  * create another HTML page which contains another form with (color, city, url, age) data and store the data in a table.
  * join the tables from the previous forms.
  * Filter the users displayed by city and favorite color.
  * check Redis to see if you have the rows cached. If you don't have them in the cache you should do the query and then store the rows in Redis.
  * Modify your Twitter API project so that you get the tweets from cache if possible. If they are not in the cache, you should request them from Twitter and cache them for 10 minutes after you get them.
  * Use sessions to change the route that users POST their names to so that it no longer writes the names and ids to a cookie but     instead adds a user property to req.session. Also change the test that redirects users who have not entered their names to the page with the form. This test should now look for req.session.user.

  * Add a logout route that calls req.session.destroy and redirects users to the form for entering their names.
  * Make a registration form and store the users's names and hash passwords in the database.

<img src='ticker.gif'>
