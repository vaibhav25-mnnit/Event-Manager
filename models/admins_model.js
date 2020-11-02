const mongoose = require('mongoose')
const schema = mongoose.Schema;

const adminschema = new schema({

    name: {
        type: String,

    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    emailtoken: {
        type: String,
    },
    isVerified: {
        type: Boolean, default: false
    },
    password: {
        type: String,
    },
    google_id: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
    },
    profile_photo: {
        type: String,
        default: ''
    },
    event_id: {
        type: Number,
        default: ''
    }

})

const Admin = mongoose.model('Admin', adminschema);


module.exports = Admin;
