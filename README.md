# MEDEASE - Healthcare Management Platform

A comprehensive full-stack web application connecting patients, doctors, and hospitals in a unified healthcare ecosystem.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)

---

## 🎯 Overview

MEDEASE addresses the fragmentation in healthcare access by providing an integrated platform where:
- **Patients** can find doctors, book appointments, conduct video consultations, and get AI-powered prescription analysis
- **Doctors** can manage appointments, conduct video calls, review prescriptions, and create patient reports
- **Hospitals** can manage doctor rosters, departments, and track operations

---

## ✨ Key Features

### For Patients
- 🔍 **Doctor Search** - Find doctors by specialty, location, and availability
- 📅 **Appointment Booking** - Schedule consultations with preferred doctors
- 🎥 **Video Consultations** - Real-time video calls with doctors using WebRTC
- 🤖 **AI Prescription Analysis** - Upload prescription images for automated medicine extraction
- 💬 **Real-time Chat** - Communicate with healthcare providers
- 📊 **Health Dashboard** - View medical history and upcoming appointments

### For Doctors
- 📈 **Dashboard** - View earnings, appointment statistics, and patient metrics
- 📋 **Appointment Management** - Accept, reschedule, and manage patient appointments
- 🎥 **Video Consultation** - Conduct remote consultations
- 📝 **Prescription Review** - Review and validate patient prescriptions
- 📄 **Medical Reports** - Create detailed patient reports

### For Hospitals
- 🏥 **Hospital Dashboard** - Overview of operations and statistics
- 👨‍⚕️ **Doctor Management** - Add, edit, and manage hospital doctors
- 🏢 **Department Management** - Organize doctors by specialties
- 📊 **Patient Tracking** - Monitor patient records and appointments

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud NoSQL database
- **Mongoose** - MongoDB ODM
- **Python** - AI processing

### Frontend
- **EJS** - Server-side templating
- **CSS** - Custom styling
- **JavaScript** - Client-side interactivity
- **jQuery DataTables** - Enhanced tables

### Real-time & AI
- **Socket.io** - Real-time communication
- **WebRTC** - Peer-to-peer video calls
- **Google Gemini API** - AI prescription analysis
- **Pillow (PIL)** - Image processing

---

## 📦 Dependencies

### Node.js Packages
```json
{
  "express": "~4.16.1",
  "mongoose": "^8.3.3",
  "ejs": "~2.6.1",
  "express-session": "^1.18.0",
  "multer": "^1.4.5-lts.1",
  "socket.io": "^4.8.3",
  "dotenv": "^16.4.5",
  "@google/generative-ai": "^0.10.0",
  "geoip-lite": "^1.4.10"
}
```

### Python Packages
```
google-generativeai
Pillow
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python 3.x
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Medease-HFT
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install Python Dependencies
```bash
pip install -r scripts/requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
PORT=4000
```

### 5. MongoDB Atlas Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with credentials
3. Whitelist your IP address
4. Copy connection string to `.env`

See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed instructions.

### 6. Start the Server
```bash
npm start
```

The application will be available at `http://localhost:4000`

---

## 📁 Project Structure

```
Medease-HFT/
├── app.js                 # Main server file
├── routes/                # Route handlers
│   ├── users.js          # Patient routes
│   ├── doctors.js        # Doctor routes
│   ├── hospital.js       # Hospital routes
│   └── prescription.js   # Prescription AI routes
├── model/                 # Mongoose schemas
│   ├── patientModel.js
│   ├── doctorModel.js
│   ├── appointmentModel.js
│   ├── prescriptionModel.js
│   ├── hospitalModel.js
│   └── reportModel.js
├── views/                 # EJS templates
│   ├── user/             # Patient views
│   ├── doctor/           # Doctor views
│   └── hospital/         # Hospital views
├── public/                # Static assets
│   └── assets/
│       ├── css/          # Stylesheets
│       ├── js/           # Client-side JavaScript
│       ├── images/       # Images
│       └── uploads/      # Uploaded files
├── scripts/               # Python scripts
│   └── analyze_prescription.py
└── package.json
```

---

## 🔑 Key Features Explained

### AI Prescription Analysis

When a patient uploads a prescription image:
1. **Multer** saves the image to `public/assets/uploads/`
2. **Node.js** spawns a Python child process
3. **Python script** uses Pillow to load the image
4. **Google Gemini API** analyzes and extracts:
   - Medicine names
   - Purpose/uses
   - Dosage information
   - Time schedule
   - Duration
5. **JSON response** sent back to frontend for display

### Real-time Video Consultations

- **WebRTC** for peer-to-peer video/audio streaming
- **Socket.io** for signaling (offer/answer/ICE candidates)
- **STUN servers** for NAT traversal
- Direct browser-to-browser communication (low latency)

### Session-based Authentication

- **Express-session** for user authentication
- Session data stored in memory (production: use Redis)
- Role-based access control for different user types
- 24-hour session expiry

---

## 🗄️ Database Schema

### Collections

- **patients** - Patient accounts and profiles
- **doctors** - Doctor profiles and credentials
- **hospitals** - Hospital information
- **appointments** - Appointment bookings and status
- **prescriptions** - Uploaded prescriptions and AI analysis
- **reports** - Medical reports and diagnoses

All schemas defined using Mongoose in the `model/` folder.

---

## 🔐 Security Features

- Session-based authentication
- Password storage (Note: Use bcrypt hashing in production)
- File upload validation
- Environment variable protection
- MongoDB Atlas network security

---

## 🌐 API Endpoints

### Patient Routes (`/`)
- `GET /login` - Patient login page
- `POST /login` - Authenticate patient
- `GET /dashboard` - Patient dashboard
- `GET /finddoctor` - Search doctors
- `POST /appointment/book` - Book appointment

### Doctor Routes (`/doctor`)
- `GET /doctor/login` - Doctor login
- `GET /doctor/profile` - Doctor dashboard
- `GET /doctor/appointment-list` - View appointments
- `GET /doctor/video-consultation` - Start video call
- `POST /doctor/save-report` - Save medical report

### Hospital Routes (`/hospital`)
- `GET /hospital/login` - Hospital login
- `GET /hospital/dashboard` - Hospital dashboard
- `POST /hospital/add-doctor` - Add new doctor
- `GET /hospital/doctor-list` - View all doctors

### Prescription Routes (`/prescription`)
- `POST /prescription/upload` - Upload and analyze prescription

---

## 🎨 Frontend Technologies

- **EJS** - Server-side rendering for better SEO
- **Vanilla CSS** - Custom responsive design
- **jQuery** - DOM manipulation and AJAX
- **DataTables** - Sortable, searchable tables
- **Socket.io Client** - Real-time features

---

## 🚧 Future Enhancements

- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email/SMS notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Redis for session storage
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Aswin Arun**
- GitHub: [@AswinArun7](https://github.com/AswinArun7)
- LinkedIn: [Aswin Arun](https://www.linkedin.com/in/aswin-arun-/)

---

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- MongoDB Atlas for cloud database
- Socket.io and WebRTC communities

