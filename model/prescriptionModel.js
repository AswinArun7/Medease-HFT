const mongoose = require("mongoose");
const Schema = new mongoose.Schema(
    {
        image: {
            type: String,
            require: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
        doctorId: {
            require: false,
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        comment:{
            require:false,
            type:String,
            default:"Wait for your answer"
        }
    },
    { timestamps: true }
)
module.exports = mongoose.model("prescription",Schema)