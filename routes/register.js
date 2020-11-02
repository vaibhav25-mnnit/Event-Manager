const router = require('express').Router();
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const crypto = require('crypto');

//config dotenv
require('dotenv').config()

//Requiring user model
const User = require('../models/user_model');
const Event = require('../models/event_modal')

//Body parser setup
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/register', (req, res) => {
    res.render('register_user')
})

router.post('/register', (req, res) => {
    const { name, id, email, gender } = req.body;


    let user_register_errors = [];

    if (!name || !id || !email || !gender) {
        user_register_errors.push({ msg: 'Please enter all fields' })
    }

    else if (id.length < 4 || id.length > 4) {
        user_register_errors.push({ msg: 'Event id must be of 4 digits' })
    }
    if (user_register_errors.length > 0) {
        res.render('register_user', {
            user_register_errors,
            name,
            id,
            email
        })
    } else {

        Event.findOne({ event_id: id })
            .then(event => {
                if (!event) {
                    user_register_errors.push({ msg: 'No Event with that id.Please enter correct event id.' })
                    res.render('register_user', {
                        user_register_errors,
                        name,
                        id,
                        gender,
                        email
                    })
                }
                else {
                    User.findOne({ $and: [{ email: email }, { id: id }] })
                        .then(user => {
                            if (user) {
                                user_register_errors.push({ msg: 'This email has already registered for this event.Try using different emial' })
                                res.render('register_user', {
                                    user_register_errors,
                                    name,
                                    id,
                                    gender,
                                    email
                                })
                            }
                            else {
                                const newuser = new User({
                                    name,
                                    id,
                                    gender,
                                    email
                                })
                                newuser.email_token = crypto.randomBytes(16).toString('hex');
                                console.log(newuser)
                                newuser.save()
                                    .then(newuser => {
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
                                            to: newuser.email,
                                            subject: 'Email Verification Link ',
                                            html:
                                                `<h1>Hello <b>${newuser.name}</b></h1>
                                                             <p>Thanks for registering for ${event.event_name}</p>
                                                             <p>Please,verify your email by clicking below</p>
                                                             <h3><b><a href="http://${req.headers.host}/user/verify-email?token=${newuser.email_token}">Click here</a></b></h3>
                                                             <h2>Thank You!</h2>`
                                        };

                                        // Sending mail
                                        transporter.sendMail(mailOptions, function (err) {
                                            if (err) {
                                                return res.status(500).send(err);
                                            }
                                            req.flash('success_msg', 'A verification mail has been send to your E-mail Please check your Inbox')
                                            return res.redirect('/user/register')
                                        })
                                    })

                            }
                        })
                        .catch((err) => {
                            console.log(err)
                        })


                }
            })
            .catch((err) => {
                console.log(err)
                res.redirect('/user/register')
            })

    }


})

router.get('/verify-email', async (req, res) => {
    try {
        const token = req.query.token
        await User.findOne({ email_token: token }, (err, user) => {
            if (err) {
                req.flash('error_msg', 'Some error happened')
                return res.redirect('/user/register')
            }
            else {
                if (!user) {
                    req.flash('error_msg', 'Sorry,Your emial has not been verified.\nPlease try after some time')
                    return res.redirect('/user/register')
                }
                else {
                    user.email_token = null,
                        user.isVerified = true,
                        user.save()
                    req.flash('success_msg', 'Your E-mail has been verified succcessfully and you are registered for the event')
                    return res.redirect('/user/register')
                }
            }
        })
    } catch (error) {
        console.log(error)
        res.send('verifing mail')
    }
})
module.exports = router;