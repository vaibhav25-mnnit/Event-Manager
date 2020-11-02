const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20');
const Admin = require('../models/admins_model');

//requirng user model
const User = require('../models/user_model')
// const Admin = require('../models/admins_model')

// //config dotenv
require('dotenv').config()

// // serializeUser and deserializeUser user functions
passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    Admin.findById(id)
        .then((user) => {
            done(null, user)
        })
})


// // Passport Google Strategy
passport.use(
    'google', new GoogleStrategy({
        callbackURL: "/auth/google/redirect",
        clientID: process.env.Google_client_ID,
        clientSecret: process.env.Google_client_secret
    }, (accessToken, refreshToken, profile, done) => {
        Admin.findOne({ google_id: profile._json.sub })
            .then((currentuser) => {
                if (currentuser) {
                    done(null, currentuser)
                } else {
                    const newUser = new Admin({
                        username: profile._json.sub,
                        name: profile._json.name,
                        google_id: profile._json.sub,
                        email: profile._json.email,
                        profile_photo: profile._json.picture,
                        isVerified: true
                    })
                    newUser.save()
                        .then(newUser => {
                            done(null, newUser)
                        })

                }
            })
            .catch((err) => {
                console.log(err)
            })
    })
)

