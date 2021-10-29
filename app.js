//Requiring all modules for project
const express = require('express')
const mongoose = require('mongoose')
const cookiesession = require('cookie-session')
const passport = require('passport');
const path = require('path');
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const session = require('express-session');
var moment = require('moment'); // require


//config dotenv
require('dotenv').config()

//creating express app
const app = express();

//Establishing connection with database(mongodb)
mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('Connected to database...'))
    .catch(err => console.log(err));


//Seting view engine to ejs
app.set('view engine', 'ejs')


//Bodyparser setup
app.use(bodyParser.urlencoded({ extended: false }))

//passport auth file from another folder
const passportSetup = require('./config/passport_setup');
const local_passport_admins = require('./config/local_passport_admins')

//nodemailer file from another folder
const Nodemailer = require('./nodemailer/nodemailer')

//Static files serving
app.use(express.static(path.join(__dirname, "static")));

//setting cookies 
app.use(cookiesession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SESSON_SECRET]
}))

// Express session
app.use(
    session({
        secret: [process.env.SESSON_SECRET],
        resave: true,
        saveUninitialized: true
    })
);

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash());


//variables for flash
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//requiring routes from different folders
const authRouts = require('./routes/outh_routes')
const profileRoutes = require('./routes/profile_routes')
const eventRoutes = require('./routes/event_routes')
const aboutRoutes = require('./routes/event_info')
const registerRoutes = require('./routes/register')

//requiring model for database
const User = require('./models/user_model')
const Admin = require('./models/admins_model')
const Event = require('./models/event_modal')



//Finding all events data form database 
let events = Event.find({})

//Home route
app.get('/', (req, res) => {
    events.exec((err, data) => {
        if (err) {
            console.log(err)
        }
        res.render('events', { events: data, moment: moment })
    });
});


//About Route for event info
app.get('/about', (req, res) => {
    res.render('about')
})

//Requiring route files from different folders
app.use('/auth', authRouts)
app.use('/profile', profileRoutes)
app.use('/create_event', eventRoutes)
app.use('/event', aboutRoutes)
app.use('/user', registerRoutes)


//Listening app
app.listen('3000', () => {
    console.log('App started on localhost...')
})



