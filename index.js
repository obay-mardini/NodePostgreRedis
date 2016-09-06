var redis = require('redis');
var clientRE = redis.createClient({
  host: 'localhost',
  port: 6379
});

clientRE.on('error', function(err) {
  console.log(err);
});

clientRE.setex('city', 60, 'berlin', function(err, data) {
    if (err) {
        return console.log(err);
    }
    console.log('the "city" key was successfully set');

    clientRE.get('city', function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('The value of the "city" key is ' + data);
    })
});
