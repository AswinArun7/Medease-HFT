const mongoose = require('mongoose')
const Schema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    department: String,
    experience: Number,
    image: {
        type: String,
        required: false,
    },
    description: String,
    address: String,
    timings: {
        type: String,
        required: false,
    },
    mobile: Number,
    email: String,
    gender: String,
    education: String,
    age: Number,
    city: String,
    State: String,
    pincode: Number,
    hospital: String,
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostpital'
    },
    password: String,
})
module.exports = mongoose.model('Doctor', Schema)