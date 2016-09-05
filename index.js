var search = require('./httpModule');
var express = require('express');
var fs = require('fs')
var app = express();
var staticProjects = express.static(__dirname + '/projects');
var pg = require('pg');
var str = 'postgres://test:12345@localhost:5432/users';
var bodyParser = require('body-parser');
var cookiesParser = require('cookie-parser');
var hb = require('express-handlebars');
var queryDB = require('./queryDB');



app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookiesParser());

app.use(staticProjects);

app.post('/filter', function(req, res) {
  queryDB.filterTable(req.body.city, req.body.color, req.body.age).then(function(val){
    res.render('hello', {
      data: val,
      city: city,
      age: age,
      color: color
    });
  });
});

app.get('/rendered', function(req,res) {
      queryDB.joinTables().then(function(val) {

        city = val.map(function(record){return record.city}).filter(function(item, index, array){return array.indexOf(item) === index});
        console.log('hello')
        color = val.map(function(record){return record.color}).filter(function(item, index, array){return array.indexOf(item) === index});
        age = val.map(function(record){return record.age}).filter(function(item, index, array){return array.indexOf(item) === index});
        console.log(city)
        res.render('hello', {
          data: val,
          city: city,
          color: city,
          age: age
        },function(err, results){
          console.log("hello")
          res.send(results)
        });
    }).catch(function(err){
      console.log(err)
    });
});

app.post('/name', function(req, res) {
  var body = req.body;
  if(!body.firstname){
    res.redirect('/name.html')
  }else {
    res.cookie('name', body.firstname);
    res.cookie('lastName', body.lastname);
    queryDB.sendQuery(body.firstname, body.lastname).then(function(val) {
      res.cookie('id',val);
      res.redirect('/newForm.html');
    }).catch(function(err) {
      console.log(err);
    });
    // will take care of the cookies later
    //console.log(req.cookies);
  }
});

app.post('/userProfile', function(req, res){
  var body = req.body;

   queryDB.makeUserProfileTable(body.age, body.city, body.url, body.color, req.cookies.id).then(function(val) {
    res.redirect('/rendered')
  });

});

// recieve a request
app.get('/helloWorld', function(req, res){
  res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});

app.get('/', function(req,res) {
  res.write('hello world');
  res.end();
});

app.post('/user', function(req, res){
  console.log(req);
  res.write('hello world');
  res.end();
});

app.get('/twitter', function(req, res){
  new Promise(function(resolve, reject) {
    resolve(search.getTokens('theOnion'))
  }).then(function(val){
      return search.search(val);
    }).then(function(val){
      var twittsArray = val.map(function(twit){
      console.log(twit.entities.urls)
        twit = twit.text.split('http');
          return {'url': twit[0], 'title': twit[0]}
      });
      return twittsArray;
    }).then(function(val){
    res.setHeader('Content-Type', 'Application/json')
    res.json(val);
  }).catch(function(err){
    res.status(500).send({error: 'something failed in the server'});
  });
});

app.use(function(req, res) {
  if(!req.body.firstname) {
    res.redirect('/name.html');
  }
});

app.listen(8080);
