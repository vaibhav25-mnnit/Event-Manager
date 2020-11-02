//Requiring nodemailer to send mail
const nodemailer = require('nodemailer');


//config dotenv
require('dotenv').config()

//requiring model for database
const User = require('../models/user_model')
const Event = require('../models/event_modal')


//Declearing different array's to store emails and date from database
let event_date = []
let date_name = []
let date = []
let user_email = []

//  functions for pushing elements in array
function store_event_dates(x) {
    event_date.push(x);
}
function store_user_emails(y) {
    user_email.push(y)
}

//Finding event dates from database inorder to set countdown for them
Event.find({})
    .then(events => {
        //Pushing dates into array 
        events.forEach(event => {
            store_event_dates(event.event_date)
        });

        for (let i = 0; i < event_date.length; i++) {

            date_name[i] = new Date(event_date[i])
            date[i] = new Date(event_date[i]).getTime()

            //Seting interval for events using event date
            var x = setInterval(() => {
                let now = new Date().getTime()
                let t = date[i] - now;

                //Condotion to perform action once the countdown has ended
                if (t < 0) {
                    clearInterval(x);
                    Event.findOne({ event_date: date_name[i] })
                        .then(event => {

                            User.find({ $and: [{ id: event.event_id }, { isVerified: true }] })
                                .then(user => {
                                    if (!user) {
                                        event.deleteOne();
                                    }
                                    user.forEach(user => {
                                        store_user_emails(user.email)
                                    });

                                    //----------------------- Creating and Sending mails to users---------------------------------------

                                    // Creating transporter method
                                    var transporter = nodemailer.createTransport({
                                        service: 'gmail',//Email service
                                        auth: {
                                            user: process.env.USER_MAIL,
                                            pass: process.env.USER_MAIL_PASSWORD
                                        }
                                    });

                                    //Creating mail 
                                    var mailOptions = {
                                        from: process.env.USER_MAIL,
                                        to: user_email,//passing email array which has all emails from database
                                        subject: 'Event Started',
                                        html: `
                                        <h1>Hello,<?h1>
                                        <p>The Event <b>${event.event_name}</b> has started at <b>${event.event_venue},${event.Zip_code}</b></p>
                                        
                                        <p>Please,reach by time</p>
                                        <h2>Thank you</h2>
                                        <h4> event manager</h4>    
                                        `,
                                    };

                                    //Sending mail
                                    var x = transporter.sendMail(mailOptions, (err, info) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            console.log('Email sent successfulley to users' + info.response);
                                        }
                                    });
                                })

                            event.deleteOne();
                        })
                }
            }, 1000)
        }


    })
    .catch((err) => {
        console.log(err)
    })









