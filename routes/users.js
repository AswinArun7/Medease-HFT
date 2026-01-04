var express = require('express');
var router = express.Router();
const patientModel = require('../model/patientModel');
const session = require("express-session");
const authMiddleware = require('../routes/authMiddleware')
const prescriptionModel = require('../model/prescriptionModel');
const doctorModel = require("../model/doctorModel")
const appointmentModel = require("../model/appointmentModel")
const hospitalModel = require("../model/hostpitalModel")
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
//implementing session
router.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
)
/* GET home page. */
router.get('/register', function (req, res, next) {
  res.render('user/register');
});
// adding patients
router.post("/register", async function (req, res, next) {
  try {
    const { name, email, password, age, gender, city, phone } = req.body

    console.log("Registration attempt:", { name, email, age, gender, city, phone })

    // Check MongoDB connection
    const mongoose = require('mongoose')
    const connectionState = mongoose.connection.readyState
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (connectionState !== 1) {
      let errorMsg = "Database connection not ready. "
      if (connectionState === 0) {
        errorMsg += "MongoDB is not connected. Please check your connection string and password in app.js"
      } else if (connectionState === 2) {
        errorMsg += "MongoDB is connecting... Please wait a moment and try again."
      }
      errorMsg += "\\n\\nCheck your server console for MongoDB connection errors."
      return res.redirect('/register?error=db_connection')
    }

    // Validate required fields
    if (!name || !email || !password || !age || !gender || !city || !phone) {
      return res.redirect('/register?error=missing_fields')
    }

    // Check if email already exists
    const existingPatient = await patientModel.findOne({ email: email })
    if (existingPatient) {
      return res.redirect('/register?error=email_exists')
    }

    const newPatient = new patientModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      age: parseInt(age),
      gender: gender,
      city: city,
      phone: parseInt(phone),
    })

    await newPatient.save()
    console.log("Patient registered successfully:", newPatient._id)

    res.redirect('/login?success=registered')
  } catch (error) {
    console.error("Registration error:", error)
    const errorMessage = error.message || "Registration failed. Please try again."
    res.redirect('/register?error=registration_failed')
  }
})

//getting login page
router.get('/login', function (req, res, next) {
  res.render('user/login');
});
// login user
router.post("/login", async function (req, res, next) {
  try {
    const email = req.body.email
    const password = req.body.password
    const user = await patientModel.findOne({ email, password })
    if (user) {
      req.session.user = user
      res.redirect("/patient-dashboard")
    } else {
      res.redirect("/login")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
})




//getting patient dashboard after login
router.get("/patient-dashboard", authMiddleware, function (req, res, next) {
  const user = req.session.user
  if (user) {
    res.render("user/patient-dashboard", { user: user })
  } else {
    res.redirect("/login")
  }
})
// Landing page - root route
router.get('/', function (req, res, next) {
  res.render('index');
});


router.get('/prescription-ai', function (req, res, next) {
  res.sendFile('views/user/prescriptionai/prescriptionai.html', { root: __dirname + '/..' });
});

router.get('/prescriptionassist', async function (req, res, next) {
  try {
    console.log(req.session.user._id)
    const prescriptions = await prescriptionModel.find({ userId: req.session.user._id })
    console.log(prescriptions)
    res.render("user/prescriptionassist", { prescriptions })
  } catch (error) {
    console.log(error)
  }

});


router.get('/enterdetials', authMiddleware, async function (req, res, next) {
  const doctors = await doctorModel.find({})
  const hospitals = await hospitalModel.find({})
  res.render('user/consult', { doctors, hospitals });
});
//finding doctor by filtering
router.post("/finddocter", authMiddleware, async function (req, res, next) {
  try {
    const { symptoms, hospital, specialty } = req.body
    let doctors

    // If hospital uniqueCode is provided, find the hospital name first
    let hospitalName = null
    if (hospital) {
      const hospitalDoc = await hospitalModel.findOne({ uniqueCode: hospital })
      if (hospitalDoc) {
        hospitalName = hospitalDoc.username
      }
    }

    if (hospitalName && specialty) {
      doctors = await doctorModel.find({
        department: specialty,
        hospital: hospitalName,
      })
    } else if (hospitalName) {
      doctors = await doctorModel.find({ hospital: hospitalName })
    } else if (specialty) {
      doctors = await doctorModel.find({ department: specialty })
    } else {
      doctors = []
    }

    res.render("user/finddocter", { doctors })
  } catch (error) {
    console.log(error)
    res.render("user/finddocter", { doctors: [] })
  }
})


router.get('/vediocall', function (req, res, next) {
  res.render('user/videocall');
});


const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace with your API key
const genAI = new GoogleGenerativeAI('AIzaSyBQGuYJeShMjlg_QiDHHDeukkLl4zjyado');

router.get('/chat', (req, res) => {
  res.render('user/chat')
})

router.post('/generate-story', async (req, res) => {
  try {
    const prompt = req.body.prompt; // Extract user input from request body

    const generationConfig = {
      stopSequences: ['red'],
      maxOutputTokens: 200,
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const storyText = response.text();

    return res.json({ story: storyText });
    // Send generated story as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Story generation failed' });
  }
});


router.get('/appointment', authMiddleware, async (req, res) => {
  try {
    const doctors = await doctorModel.find({})
    const hospitals = await hospitalModel.find({})
    
    // Fetch user appointments based on email
    const userEmail = req.session.user ? req.session.user.email : null
    let appointments = []
    if (userEmail) {
      appointments = await appointmentModel.find({ email: userEmail }).sort({ date: -1 })
    }
    
    res.render('user/appointment', { doctors, hospitals, appointments, user: req.session.user })
  } catch (error) {
    console.error('Error fetching appointment data:', error)
    res.render('user/appointment', { doctors: [], hospitals: [], appointments: [], user: req.session.user })
  }
})
//booking an appointment

router.post("/book-appointment", async (req, res) => {
  try {
    const { firstname, lastname, gender, mobile, email, address, date, doctor, hospital, Symptom, mode } = req.body
    
    // If hospital is uniqueCode, fetch the hospital name
    let hospitalName = hospital
    if (hospital) {
      const hospitalDoc = await hospitalModel.findOne({ uniqueCode: hospital })
      if (hospitalDoc) {
        hospitalName = hospitalDoc.username
      }
    }
    
    await new appointmentModel({
      firstname,
      lastname,
      gender,
      mobile,
      email,
      address,
      date,
      doctor,
      Hospital: hospitalName,
      Symptom,
      mode,
    }).save()
    res.redirect('/appointment?success=true')
  } catch (error) {
    console.error("Appointment booking error:", error)
    res.redirect('/appointment?error=true')
  }
})

router.get('/pharma', authMiddleware, (req, res) => {
  res.render('user/pharma/pharma')
})

router.get('/finddocters', authMiddleware, async (req, res) => {
  const doctors = await doctorModel.find({})
  const hospitals = await hospitalModel.find({})
  res.render('user/finddocter', { doctors, hospitals })
})

router.get('/genaral', authMiddleware, (req, res) => {
  res.render('user/genaral')
})

router.get('/premium', (req, res) => {
  res.render('user/premium')
})


module.exports = router;
