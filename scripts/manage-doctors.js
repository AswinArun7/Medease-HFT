// Script to view and clean up doctor data
require('dotenv').config();
const mongoose = require('mongoose');
const doctorModel = require('../model/doctorModel');
const hospitalModel = require('../model/hostpitalModel');

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://achus2710_db_user:medece123@hft.h7axldb.mongodb.net/medeasedb?retryWrites=true&w=majority&appName=HFT";

async function manageDoctors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✓ Connected to MongoDB\n');

        // Get all hospitals
        const hospitals = await hospitalModel.find({});
        console.log('=== HOSPITALS IN DATABASE ===');
        hospitals.forEach(hospital => {
            console.log(`- ${hospital.username} (Code: ${hospital.uniqueCode || 'NO CODE'})`);
        });

        // Get all doctors
        const doctors = await doctorModel.find({});
        console.log(`\n=== ALL DOCTORS (${doctors.length} total) ===`);

        // Group doctors by hospital
        const doctorsByHospital = {};
        doctors.forEach(doctor => {
            const hospitalName = doctor.hospital || 'NO HOSPITAL';
            if (!doctorsByHospital[hospitalName]) {
                doctorsByHospital[hospitalName] = [];
            }
            doctorsByHospital[hospitalName].push(doctor);
        });

        // Display doctors grouped by hospital
        for (const [hospitalName, hospitalDoctors] of Object.entries(doctorsByHospital)) {
            console.log(`\n--- ${hospitalName} (${hospitalDoctors.length} doctors) ---`);
            hospitalDoctors.forEach((doc, index) => {
                console.log(`  ${index + 1}. Dr. ${doc.firstname} ${doc.lastname} - ${doc.department} (Email: ${doc.email})`);
            });
        }

        // Option to delete doctors with specific criteria
        console.log('\n=== CLEANUP OPTIONS ===');
        console.log('1. Delete doctors with NO hospital assigned');
        console.log('2. Delete doctors from non-existent hospitals');
        console.log('3. Delete ALL doctors (CAUTION!)');
        console.log('4. Delete doctors by specific hospital name');
        console.log('\nTo delete, uncomment the appropriate section below and run again.\n');

        // UNCOMMENT ONE OF THESE SECTIONS TO DELETE:

        // // 1. Delete doctors with no hospital
        // const result1 = await doctorModel.deleteMany({
        //     $or: [
        //         { hospital: { $exists: false } },
        //         { hospital: null },
        //         { hospital: "" }
        //     ]
        // });
        // console.log(`Deleted ${result1.deletedCount} doctors with no hospital`);

        // // 2. Delete doctors from non-existent hospitals
        // const validHospitalNames = hospitals.map(h => h.username);
        // const result2 = await doctorModel.deleteMany({
        //     hospital: { $nin: validHospitalNames }
        // });
        // console.log(`Deleted ${result2.deletedCount} doctors from non-existent hospitals`);

        // // 3. Delete ALL doctors (CAUTION!)
        // const result3 = await doctorModel.deleteMany({});
        // console.log(`Deleted ${result3.deletedCount} doctors (ALL DOCTORS REMOVED)`);

        // // 4. Delete doctors by specific hospital name
        // const hospitalToDelete = "HOSPITAL_NAME_HERE"; // Replace with actual hospital name
        // const result4 = await doctorModel.deleteMany({ hospital: hospitalToDelete });
        // console.log(`Deleted ${result4.deletedCount} doctors from ${hospitalToDelete}`);

    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
        process.exit(0);
    }
}

// Run the script
manageDoctors();
