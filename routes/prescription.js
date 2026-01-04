var express = require("express")
var router = express.Router()
const prescriptionModel = require("../model/prescriptionModel")
const { route } = require("./doctors")
const upload = require("./multerMiddleware")

// adding prescription image to prescription model
router.post("/uploadPrescription", upload.single("prescription"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }
        console.log(req.file)
        const prescription = new prescriptionModel({
            image: req.file.filename, 
            userId: req.session.user._id,

        })
        await prescription.save()
        res.status(200).send('<script>alert("Prescription uploded successfully")</script>')
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error" })
    }
})


// getiing prescription by the user
router.get("/getPrescriptionByUser",async (req, res) => {
    try {
        const prescription = await prescriptionModel.find({
            user: req.user._id,
        })
        res.render("prescription", { prescription })
    } catch (error) {
        console.log(error)
    }
})



//getting all users prescription by the doctor
router.get("/getAllPrescription",async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find()
        res.render("allPrescription", { prescriptions })
    } catch (error) {
        console.log(error)
    }
})

// doctor adding comment to the particular description
router.post("/doctorAddingComment/:id", async (req, res) => {
    try {
        const prescriptionId = req.params.id
        const comment = req.body.comment
        await prescriptionModel.findByIdAndUpdate(
            prescriptionId,
            { $set: { comment } },
            { new: true }
        )
        res.json({ message: "comment added successfully" })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
