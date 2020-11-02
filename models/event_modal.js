const mongoose = require('mongoose')
const schema = mongoose.Schema;

const eventschema = new schema({

    event_name: {
        type: String,

    },
    event_venue: {
        type: String,
    },
    Zip_code: {
        type: Number,
    },
    event_date: {
        type: Date,
    },
    event_description: {
        type: String,
    },
    event_id: {
        type: String,
    }
})

const Event = mongoose.model('Event', eventschema);


module.exports = Event;
