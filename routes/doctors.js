var express = require("express")
var router = express.Router()
var session = require("express-session")
var Doctor = require("../model/doctorModel")
const doctorModel = require("../model/doctorModel")
const appointmentModel = require("../model/appointmentModel")
const prescriptionModel = require("../model/prescriptionModel")
const hostpitalModel = require("../model/hostpitalModel")
const reportModel = require("../model/reportModel")

router.use(
    session({
        secret: "doctor",
        resave: false,
        saveUninitialized: true,
    })
)

/* GET login page. */
router.get("/login", function (req, res, next) {
    try {
        res.render("doctor/login")
    } catch (error) {
        console.log(error)
    }

})

// get doctor register page
router.get("/register", function (req, res, next) {
    try {
        res.render("doctor/register")
    } catch (error) {
        console.log(error)
    }

})

// get doctor profile page
router.get("/profile", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login");
        }
        const doctor = await doctorModel.findById(req.session.doctorId);
        if (!doctor) {
            req.session.destroy();
            return res.redirect("/doctor/login");
        }
        
        // Fetch appointments for this doctor
        const appointments = await appointmentModel.find({
            doctor: doctor.firstname
        }).sort({ date: 1 }).limit(10);
        
        // Fetch prescriptions reviewed by this doctor
        const prescriptions = await prescriptionModel.find({
            comment: { $exists: true, $ne: 'Wait for your answer' }
        }).populate('userId').sort({ updatedAt: -1 }).limit(10);
        
        // Calculate stats
        const totalAppointments = await appointmentModel.countDocuments({ doctor: doctor.firstname });
        const totalPrescriptions = await prescriptionModel.countDocuments();
        
        res.render("doctor/doctor-dashboard", { 
            doctor, 
            appointments,
            prescriptions,
            stats: {
                totalAppointments,
                totalPrescriptions
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
})

// Adding doctors
router.post("/register", async function (req, res, next) {
    try {
        const { name,
            specialization,
            experience,
            description,
            address,
            phone,
            email,
            city,
            gender,
            age,
            password,
            hospitalCode
        } = req.body

        // Validate required fields
        if (!name || !email || !password || !specialization || !phone || !city || !hospitalCode) {
            return res.redirect('/doctor/register?error=missing_fields')
        }

        // Check if email already exists
        const existingDoctor = await doctorModel.findOne({ email: email })
        if (existingDoctor) {
            return res.redirect('/doctor/register?error=email_exists')
        }

        // Verify Hospital Code
        const hospital = await hostpitalModel.findOne({ uniqueCode: hospitalCode })
        if (!hospital) {
            return res.redirect('/doctor/register?error=invalid_hospital')
        }

        // Split name into firstname and lastname
        const nameParts = name.trim().split(' ')
        const firstname = nameParts[0] || name
        const lastname = nameParts.slice(1).join(' ') || ''

        const doctor = new Doctor({
            firstname: firstname,
            lastname: lastname,
            department: specialization, // Map specialization to department
            experience,
            description: description || '',
            address: address || '',
            mobile: phone, // Map phone to mobile
            email,
            gender: gender || '',
            age: age || '',
            city,
            password,
            hospital: hospital.username, // Store hospital name for display/legacy
            hospitalId: hospital._id // Link to hospital document
        })
        await doctor.save()
        res.redirect('/doctor/login?success=registered')
    } catch (error) {
        console.log(error)
        res.redirect('/doctor/register?error=registration_failed')
    }
})

// Login doctor
router.post("/loginDoctor", async function (req, res, next) {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({
            email: email,
            password: password,
        })
        console.log(doctor)
        console.log(req.body)
        if (doctor) {
            req.session.doctorId = doctor._id
            req.session.doctorName = doctor.firstname
            return res.redirect("/doctor/profile")
        } else {
            return res.redirect("/doctor/login")
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send("Internal Server Error")
    }
})
//get Appointments

router.get("/appointments", async function (req, res, next) {
    if (!req.session.doctorId) {
        res.redirect("/login")
    } else {
        const Appointments = await appointmentModel.find({ doctorId: req.session.doctorId })
        res.render("doctors/appointments", { Appointments })
    }
})

//list all the appoitments of that doctor

router.get("/appointment-List", async function (req, res, next) {
    try {
        if (!req.session.doctorName) {
            return res.redirect("/doctor/login")
        }
        
        // Fetch appointments where doctor name matches the logged-in doctor's name
        const appointments = await appointmentModel.find({
            doctor: req.session.doctorName,
        }).sort({ date: -1 })
        
        console.log('Doctor appointments found:', appointments.length)
        res.render("doctor/appointment-list", { appointments, doctor: { firstname: req.session.doctorName } })
    } catch (error) {
        console.error('Error fetching doctor appointments:', error)
        res.render("doctor/appointment-list", { appointments: [], doctor: { firstname: req.session.doctorName || '' } })
    }
})

// Get appointment details
router.get("/appointment-details/:id", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login")
        }
        
        const appointment = await appointmentModel.findById(req.params.id)
        if (!appointment) {
            return res.redirect("/doctor/profile")
        }
        
        const doctor = await doctorModel.findById(req.session.doctorId)
        res.render("doctor/appointment-details", { appointment, doctor })
    } catch (error) {
        console.error('Error fetching appointment details:', error)
        res.redirect("/doctor/profile")
    }
})

// Update appointment (reschedule)
router.post("/appointment-reschedule/:id", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login")
        }
        
        const { newDate } = req.body
        await appointmentModel.findByIdAndUpdate(req.params.id, { 
            rescheduledDate: newDate,
            status: 'rescheduled',
            respondedAt: new Date()
        })
        
        res.redirect('/doctor/profile?success=rescheduled')
    } catch (error) {
        console.error('Error rescheduling appointment:', error)
        res.redirect('/doctor/profile?error=reschedule_failed')
    }
})

// Video consultation page
router.get("/video-consultation", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login")
        }
        
        const { appointmentId, patientName, patientEmail } = req.query
        const doctor = await doctorModel.findById(req.session.doctorId)
        const roomId = `apt${appointmentId}`
        
        // Update appointment status and add video call link
        const videoCallLink = `https://vdo.ninja/?room=${roomId}&view=${roomId}&label=${encodeURIComponent(patientName)}`
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: 'accepted',
            videoCallLink: videoCallLink,
            respondedAt: new Date()
        })
        
        res.render("doctor/video-consultation", { 
            appointmentId, 
            patientName, 
            patientEmail,
            doctor,
            roomId
        })
    } catch (error) {
        console.error('Error loading video consultation:', error)
        res.redirect("/doctor/profile")
    }
})

// Report generation page
router.get("/report-generation", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login")
        }
        
        const { appointmentId } = req.query
        const doctor = await doctorModel.findById(req.session.doctorId)
        const appointment = appointmentId ? await appointmentModel.findById(appointmentId) : null
        
        res.render("doctor/doctorreport/reportgeneration", { 
            doctor,
            appointment
        })
    } catch (error) {
        console.error('Error loading report generation:', error)
        res.redirect("/doctor/profile")
    }
})

// Save report to database
router.post("/save-report", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        
        const reportData = {
            appointmentId: req.body.appointmentId,
            doctorId: req.session.doctorId,
            patientEmail: req.body.patientEmail,
            hospital: req.body.hospital,
            logoUrl: req.body.logoUrl,
            doctorName: req.body.doctorName,
            qualification: req.body.qualification,
            registrationNumber: req.body.registrationNumber,
            signatureUrl: req.body.signatureUrl,
            jurisdiction: req.body.jurisdiction,
            consultationMode: req.body.consultationMode,
            callStartTime: req.body.callStartTime,
            callEndTime: req.body.callEndTime,
            duration: req.body.duration,
            clinicalComplaints: req.body.clinicalComplaints,
            clinicalImpression: req.body.clinicalImpression,
            medicalAdvice: req.body.medicalAdvice,
            followupPlan: req.body.followupPlan
        }
        
        const report = new reportModel(reportData)
        await report.save()
        
        // Update appointment status to completed
        await appointmentModel.findByIdAndUpdate(req.body.appointmentId, { status: 'completed' })
        
        res.json({ success: true, message: 'Report saved successfully' })
    } catch (error) {
        console.error('Error saving report:', error)
        res.status(500).json({ error: 'Failed to save report' })
    }
})

// Get reports for an appointment
router.get("/appointment-reports/:appointmentId", async function (req, res, next) {
    try {
        if (!req.session.doctorId) {
            return res.redirect("/doctor/login")
        }
        
        const reports = await reportModel.find({ appointmentId: req.params.appointmentId })
        res.json({ reports })
    } catch (error) {
        console.error('Error fetching reports:', error)
        res.status(500).json({ error: 'Failed to fetch reports' })
    }
})
//list all prescription

router.get("/prescriptionListing", async function (req, res, next) {
    try {
        const prescriptions = await prescriptionModel.find({})
        res.render("doctor/prescription-list", { prescriptions })
    } catch (error) {
        console.error(error)
    }
})

// reviewing prescription

router.post("/reviewingPrescription", async function (req, res, next) {
    try {
        const prescriptionId = req.body.prescriptionId
        const comment = req.body.prescriptionComment
        await prescriptionModel.findByIdAndUpdate(prescriptionId, {
            comment: comment,
        })

        res.redirect('/doctor/prescriptionListing?success=reviewed')
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
})
// Logout doctor
router.get("/logout", async function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            console.error("Error destroying session:", err)
        }
        res.redirect("/login")
    })
})


module.exports = router
// restart trigger
