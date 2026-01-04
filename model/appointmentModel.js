const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    gender: String,
    mobile: Number,
    email: String,
    address: String,
    date: String,
    From: String,
    To: String,
    doctor: String,
    Hospital: String,
    Symptom: String,
    mode: String,
})
module.exports = mongoose.model("appointment", Schema)