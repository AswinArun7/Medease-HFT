var express = require("express")
var router = express.Router()
var appointmentModel = require("../model/appointmentModel")
var patientModel = require("../model/patientModel")
var doctorModel = require("../model/doctorModel")

// Get online appointment
router.get("/getOnlineAppointment", function (req, res, next) {
    try {
       res.render("online-appointment")  
    } catch (error) {
       console.log(error)   
    }
   
})

//Get offline appointment
router.get("/getOfflineAppointment", function (req, res, next) {
    try {
         res.render("offline-appointment")
    } catch (error) {
        console.log(error)
    }
   
})
//geting doctor near to patient
router.get("/nearByDoctor", async (req, res, next)=>{
     try {
        const patientCity= await patientModel.find({city:req.user.city})
        res.render("nearByDoctor",{patientCity})
     } catch (error) {
          console.log(error)
     }
} )

//get doctor by symptom
router.get("/getDoctorBySymptom/:symptom", async (req, res, next) => {
    try {
        const symptom = req.params.symptom.toLowerCase()
        let specializations = []
        if (symptom === "cough") {
            specializations = ["pulmonologist", "general", "ENT"]
        } else if (symptom === "headache") {
            specializations = ["neurologist", "general"]
        }
        else if(symptom === "skin rash"){
            specializations = ["Dermatologist", "general"]        
        }
        else if(symptom === "Chest pain"){
            specializations = ["Cardiologist", "general"]
        }else if(symptom === "fever"){
            specializations = ["General"]
        }else if(symptom === "vomiting"){
            specializations = ["ENT"]
        }else if(symptom === "nausea"){
            specializations = ["Orthopedic"]
        }else if(symptom === "sore throat"){
            specializations = ["Orthopedic"]
        }else if(symptom === "diarrhea"){
            specializations = ["General"]
        }
        else {

            return res.status(400).send("Unknown symptom")
        }
        const doctors = await fetchDoctor(specializations)
        res.render("getDoctorBySymptom", { doctors })
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
})

async function fetchDoctor(specializations) {
    try {
        const doctors = await doctorModel.find({
            specialization: { $in: specializations },
        })
        return doctors
    } catch (error) {
        console.log(error)
        throw error
    }
}




module.exports = router
