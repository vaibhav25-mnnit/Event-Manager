const router = require('express').Router();
const passport = require('passport')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const crypto = require('crypto')

//config dotenv
require('dotenv').config()

//requiring Admin model
const Admin = require('../models/admins_model');
const Event = require('../models/event_modal');
const User = require('../models/user_model')
const { query } = require('express');

//Body parser setup
router.use(bodyParser.urlencoded({ extended: false }))

//Middlware to protect profile route
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('error_msg', 'Please Log in')
    res.redirect('/create_event/log_in')
}

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('event_form')
})

router.post('/', (req, res) => {

    const { event_name,
        event_venue,
        Zip_code,
        event_date,
        event_description } = req.body;

    let event_errors = [];

    //Date validation calculation
    let now = new Date().getTime()
    let dt = new Date(event_date).getTime();
    let difference = dt - now;

    if (!event_name || !event_venue || !Zip_code || !event_date || !event_description) {
        event_errors.push({ msg: 'Please enter all fields' })
    }

    else if (difference <= 0) {
        event_errors.push({ msg: 'Entered date has already passed' })
    }

    if (event_errors.length > 0) {
        res.render('event_form', {
            event_errors,
            event_name,
            event_venue,
            Zip_code,
            event_date,
            event_description
        })
    }
    else {

        //Creating Random Four digit number for event id
        let event_id = Math.floor(1000 + Math.random() * 9000);
        Admin.findOne({ username: req.user.username })
            .then(admin => {
                admin.event_id = event_id
                admin.save()
                console.log(admin)
            })

        //creating object of  Event Schema
        const newevent = new Event({
            event_name,
            event_venue,
            Zip_code,
            event_date,
            event_description
        })
        //assigning the value of event id to random number as created above
        newevent.event_id = event_id,
            //Saving new event
            newevent.save()
                .then(event => {

                    res.render('success_event', { code: event_id })
                })
                .catch((err) => {
                    console.log(err)
                    res.redirect('/create_event/')
                })
    }
})

router.get('/log_in', (req, res) => {
    res.render('event_create_login')
})

router.post('/log_in', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/create_event/profile',
        failureRedirect: '/create_event/log_in',
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res) => {
    res.render('event_create_register')
})

router.post('/register', async (req, res) => {
    const { name, username, email, password, password2, gender } = req.body;
    let errors = [];

    if (!name || !username || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    else if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    else if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('event_create_register', {
            errors,
            name,
            username,
            email,
            password,
            password2,
            gender

        });
    }

    else {
        try {
            await Admin.findOne({ email: email }, (err, admin) => {
                if (err) {
                    console.log(err)
                }
                else {
                    if (admin) {
                        errors.push({ msg: "Entered Email is already registered with another account try using different emial" })
                        console.log("exists")
                        res.render('event_create_register', {
                            errors,
                            name,
                            username,
                            email,
                            password,
                            password2,
                            gender
                        });
                    }
                    else {
                        Admin.findOne({ username: username })
                            .then(admin => {
                                if (admin) {
                                    errors.push({ msg: "That user name already exists try using another user name" });
                                    res.render('event_create_register', {
                                        errors,
                                        name,
                                        username,
                                        email,
                                        password,
                                        password2,
                                        gender
                                    });
                                }
                                else {
                                    const newadmin = new Admin({
                                        name,
                                        username,
                                        email,
                                        password,
                                        gender
                                    });

                                    if (newadmin.gender == 'Male') {
                                        newadmin.profile_photo = 'https://w7.pngwing.com/pngs/304/305/png-transparent-man-with-formal-suit-illustration-web-development-computer-icons-avatar-business-user-profile-child-face-web-design.png'
                                    }
                                    else {
                                        newadmin.profile_photo = 'https://www.iconspng.com/images/cartoon-woman-avatar-2/cartoon-woman-avatar-2.jpg'
                                    }
                                    bcrypt.genSalt(10, (err, salt) => {
                                        bcrypt.hash(newadmin.password, salt, (err, hash) => {
                                            if (err) throw err;
                                            newadmin.password = hash;
                                            newadmin.emailtoken = crypto.randomBytes(16).toString('hex');



                                            newadmin.save()
                                                .then((newuser) => {
                                                    // Send email (use credintials of Gmail)
                                                    var transporter = nodemailer.createTransport({
                                                        service: 'gmail',
                                                        auth: {
                                                            user: process.env.USER_MAIL,
                                                            pass: process.env.USER_MAIL_PASSWORD
                                                        }
                                                    });

                                                    //Creating token mail
                                                    var mailOptions = {
                                                        from: process.env.USER_MAIL,
                                                        to: newadmin.email,
                                                        subject: 'Account Verification Link',
                                                        html:
                                                            `<h1>Hello <b>${newadmin.username}</b></h1>
                                                             <p>Thanks for registering with event manager </p>
                                                             <p>Please,verify your account by clicking below</p>
                                                             <h3><b><a href="http://${req.headers.host}/create_event/verify-email?token=${newadmin.emailtoken}">Click here</a></b></h3>
                                                             <h2>Thank You!</h2>`
                                                    };

                                                    // Sending mail
                                                    transporter.sendMail(mailOptions, function (err) {
                                                        if (err) {
                                                            return res.status(500).send(err);
                                                        }
                                                        req.flash('success_msg', 'A verification mail has been send to your E-mail Please check your Inbox')
                                                        return res.redirect('/create_event/log_in')
                                                    })

                                                })

                                        })


                                    })
                                }

                            })
                    }
                }

            })
        } catch (error) {
            console.log(error)
        }
    }
})

router.get('/verify-email', async (req, res) => {
    try {
        const token = req.query.token
        await Admin.findOne({ emailtoken: token }, (err, admins) => {
            if (err) {
                req.flash('error_msg', 'Some error happened')
                return res.redirect('/create_event/register')
            }
            else {
                if (!admins) {
                    req.flash('error_msg', 'Sorry,Your emial has not been verified.\nPlease try after some time')
                    return res.redirect('/create_event/register')
                } else {
                    admins.emailtoken = null;
                    admins.isVerified = true;
                    admins.save()
                    req.flash('success_msg', 'Your E-mail has been verified succcessfully.\nPlease login')
                    return res.redirect('/create_event/log_in')
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.send('verifing mail')
    }

})

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
        name: req.user.name,
        image: req.user.profile_photo,
        event: req.user.event_id
    })
})

router.post('/profile', ensureAuthenticated, (req, res) => {
    const { id } = req.body

    if (!id) {

        req.flash('error_msg', 'Please,enter the id')
        return res.redirect('/create_event/profile')
    }

    else if (id.length > 4 || id.length < 4) {
        req.flash('error_msg', 'Event id should be of 4 digits')
        return res.redirect('/create_event/profile')
    }
    else {
        Admin.findOne({ event_id: id })
            .then(admin => {
                if (!admin) {
                    req.flash('error_msg', 'Entered event id is incorrect.Please enter correct id')
                    return res.redirect('/create_event/profile')
                }
                else {
                    let users = User.find({ $and: [{ id: id }, { isVerified: true }] })

                    users.exec((err, data) => {
                        if (err) {
                            console.log(err)
                            return res.redirect('/create_event/profile')
                        }
                        else {
                            res.render('profile_with_users', {
                                name: req.user.name,
                                image: req.user.profile_photo,
                                event: req.user.event_id,
                                users: data
                            })
                        }
                    })

                }
            })
    }

})

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are now loged out')
    res.redirect('/create_event/log_in')
})

module.exports = router;
