var search = require('./httpModule');
var express = require('express');
var fs = require('fs')
var app = express();
var staticProjects = express.static(__dirname + '/projects');
var pg = require('pg');
var str = 'postgres://test:12345@localhost:5432/users';
var bodyParser = require('body-parser');
//var cookiesParser = require('cookie-parser');
var hb = require('express-handlebars');
var queryDB = require('./queryDB');
var redis = require('redis');
var clientRE = redis.createClient({
  host: 'localhost',
  port: 6379
});
var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

var session = require('express-session');
var Store = require('connect-redis')(session);
var crypt = require('./crypting.js');

app.use(session({
    store: new Store({
        ttl: 3600,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'my super fun secret'
}));
app.engine('handlebars', hb());

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));

//app.use(cookiesParser());

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
    //
      queryDB.joinTables().then(function(val) {
        color = val.map(function(record){
          return record.color;
        }).filter(function(item, index, array){
          return array.indexOf(item) === index;
        });

        city = val.map(function(record){
          return record.city
        }).filter(function(item, index, array){
          return array.indexOf(item) === index;
        });

        age = val.map(function(record){
          return record.age;
        }).filter(function(item, index, array){
          return array.indexOf(item) === index;
        });

        res.render('hello', {
          data: val,
          city: city,
          color: city,
          age: age
        },function(err, results){
          res.send(results)
        });
    });
});

app.get('/logIn', function(req, res){
    res.render('logInForm');
});

app.post('/logInForm', function(req, res) {
    var body = req.body;
    //queryDB.checkUserAuth(body.email, res);
    queryDB.checkUserAuth(body.email,body.password, function(err, data) {
        if(err){
            res.render('logInForm', {
                message: 'you email or password are not correct'
            });
        }
        if(data){
            req.session.user = {
              id: data
            };
            res.redirect('/rendered');
        }
    });
});

app.post('/editProfile', function(req, res) {
    var columns = ['firstname', 'lastname' ,'email','password', 'age','city','url','color'];
    var registerationObj = {};
    var profileObj = {};

    columns.forEach(function(item,index,array) {
        if(index < 4 && req.body[item]) {
            registerationObj[item] = req.body[item];
        } else if(index >= 4 && req.body[item]){
            profileObj[item] = req.body[item];
        }
    });
    console.log()
    queryDB.updateRecord(registerationObj,req.session,'registration',function(err,data){
        console.log(data)
        if(err){
            res.status(404);
        } else {
            queryDB.updateRecord(profileObj,req.session, 'user_profiles',function(err,data){
                if(err){
                    res.status(404);
                } else {
                    res.redirect('/rendered')
                }
            });
        }
    });
});

app.get('/editProfile', function(req, res){
    res.render('editProfile',{
        layout: "form",
        name: 'obay'
    });

});

app.post('/name', function(req, res) {
  var body = req.body;
  if(!body.firstname){
    res.redirect('/name.html')
  }else {
    /*
    res.cookie('name', body.firstname);
    res.cookie('lastName', body.lastname);
    */
    queryDB.sendQuery(body.firstname, body.lastname).then(function(val) {
      req.session.user = {
        firstName: body.firstname,
        lastName: body.lastname,
        id: val
    };
      res.redirect('/newForm.html');
    }).catch(function(err) {
      res.sendStatus(500);
    });
    // will take care of the cookies later
    //console.log(req.cookies);
  }
});

app.post('/registrationForm', function(req, res) {
  var body = req.body;
  if(!body.firstname || !body.password || !body.lastname || !body.email){
    res.redirect('/name.html')
  }else {
    crypt.hashPassword(body.password).then(function(hash){
        return queryDB.signUp(body.firstname,body.lastname, body.email, hash);
    }).then(function(id){
        req.session.user = {
          name: body.firstname + body.lastname,
          email: body.email,
          id: id
        }
       res.redirect('/newForm.html');
   });
  }
});

app.post('/userProfile', function(req, res){
  var body = req.body;
   queryDB.makeUserProfileTable(body.age, body.city, body.url, body.color, req.session.user.id).then(function(val) {
    res.redirect('/rendered')
  });
});

// recieve a request
app.get('/helloWorld', function(req, res){
  res.send('<!doctype html><title>Hello World!</title><p>Hello World!</html>');
});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
  });
    res.redirect('/rendered');
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
    clientRE.get('twitterDATA', function(err, data){
      if(err){
        console.log(err);
      }
      if(data){
        console.log('get')
        resolve(JSON.parse(data));
      }
      resolve(search.getTokens('theOnion'))
    });

  }).then(function(val){
      return search.search(val);
    }).then(function(val){
      var twittsArray = val.map(function(twit){
        twit = twit.text.split('http');
        return {'url': twit[0], 'title': twit[0]}
      });
      return twittsArray;
    }).then(function(val){
    res.setHeader('Content-Type', 'Application/json')
    res.json(val);
  }).catch(function(err){
    console.log(err)
    res.status(500).send({error: 'something failed in the server'});
  });
});

app.use(function(req, res) {
  if(!req.body.firstname) {
    res.redirect('/name.html');
  }
});

app.listen(8080);
