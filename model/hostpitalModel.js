const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    username: String,
    address: String,
    phone: String,
    email: String,
    password: String,
    city: String,
    image: {
        type: String,
        required: false,
    },
    departments: {
        type: [String],
        default: [],
    },
    uniqueCode: {
        type: String,
        required: true,
        unique: true,
    },
})
module.exports = mongoose.model("Hostpital", Schema)