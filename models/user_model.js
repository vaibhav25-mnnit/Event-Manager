const mongoose = require('mongoose')
const schema = mongoose.Schema;

const userschema = new schema({

    name: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
    },
    email: {
        type: String,
    },
    id: {
        type: String,
    },
    email_token: {
        type: String,
    },
    gender: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', userschema);

module.exports = User;
