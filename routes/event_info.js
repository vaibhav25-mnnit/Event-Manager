const router = require('express').Router();
const bodyParser = require('body-parser')
var moment = require('moment');



const Event = require('../models/event_modal')

//Body parser setup
router.use(bodyParser.urlencoded({ extended: false }))

router.get('/about', (req, res) => {
    res.render('event_code')
})

router.post('/about', (req, res) => {

    const { event_id } = req.body
    let event_info_errors = []
    if (!event_id) {
        event_info_errors.push({ msg: 'Please enter all fields' })
    }
    else if (event_id.length < 4 || event_id.length > 4) {
        event_info_errors.push({ msg: 'Event id must be of 4 digits' })
    }
    if (event_info_errors.length > 0) {
        res.render('event_code', {
            event_info_errors,
            event_id
        })
    }
    else {
        Event.findOne({ event_id: event_id })
            .then(event => {
                if (!event) {
                    req.flash('error_msg', 'No event with that Id. Please enter correct event id')
                    res.redirect('/event/about')
                }
                else {
                    res.render('home', {
                        name: event.event_name,
                        id: event.event_id,
                        venue: event.event_venue,
                        Zip_code: event.Zip_code,
                        description: event.event_description,
                        date: event.event_date,
                        moment: moment
                    })
                }
            })
            .catch((err) => {
                console.log(err)
                res.redirect('/event/about')
            })
    }
})



module.exports = router;