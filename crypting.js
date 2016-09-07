var bcrypt = require('bcrypt');

function hashPassword(plainTextPassword, checkWith) {
    bcrypt.genSalt(function(err, salt) {
        if (err) {
            return console.log(err);
        }

        console.log('salt   ' + salt);
        bcrypt.hash(plainTextPassword, salt, function(err, hash) {
            if (err) {
                console.log(err)
            }
            checkPassword(checkWith, hash, function(err, doesMatch) {
              console.log('number or rounds ' + bcrypt.getRounds(hash));
              if(err){
                console.log(err)
              }else {
                console.log(hash)
                console.log(doesMatch)
              }
            })
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
        if (err) {
            return callback(err);
        }
        console.log(doesMatch);
        callback(null, doesMatch);
    });
}

exports.checkMyPassword = hashPassword;
hashPassword('mama', 'mama')
