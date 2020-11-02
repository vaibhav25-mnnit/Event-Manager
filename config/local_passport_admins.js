const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//requirng user model
const Admin = require('../models/admins_model')
// serializeUser and deserializeUser user functions
passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    Admin.findById(id)
        .then((user) => {
            done(null, user)
        })
})


passport.use(
    new LocalStrategy(
        function (username, password, done) {
            Admin.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    console.log('incorrect user name')
                    return done(null, false, { message: 'Incorrect username.' });
                }
                bcrypt.compare(password, user.password, (err, isMatched) => {
                    if (err) throw err;
                    else if (isMatched) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'Password Incorrect' });
                    }
                })

            });
        }
    ));
