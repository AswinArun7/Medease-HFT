const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appointment",
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    patientEmail: String,
    
    // Hospital Info
    hospital: String,
    logoUrl: String,
    
    // Doctor Info
    doctorName: String,
    qualification: String,
    registrationNumber: String,
    signatureUrl: String,
    
    // Consultation Info
    jurisdiction: String,
    consultationMode: String,
    callStartTime: Date,
    callEndTime: Date,
    duration: String,
    
    // Medical Data
    clinicalComplaints: String,
    clinicalImpression: String,
    medicalAdvice: String,
    followupPlan: String,
    
    // Metadata
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model("report", Schema)
