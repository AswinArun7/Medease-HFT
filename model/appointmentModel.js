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
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rescheduled', 'completed', 'cancelled'] },
    videoCallLink: String,
    rescheduledDate: String,
    respondedAt: Date
}, { timestamps: true })
module.exports = mongoose.model("appointment", Schema)