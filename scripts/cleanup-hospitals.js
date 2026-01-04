// Script to remove hospitals without uniqueCode from database
require('dotenv').config();
const mongoose = require('mongoose');
const hospitalModel = require('../model/hostpitalModel');

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://achus2710_db_user:medece123@hft.h7axldb.mongodb.net/medeasedb?retryWrites=true&w=majority&appName=HFT";

async function cleanupHospitals() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✓ Connected to MongoDB');

        // Find hospitals without uniqueCode
        const hospitalsWithoutCode = await hospitalModel.find({
            $or: [
                { uniqueCode: { $exists: false } },
                { uniqueCode: null },
                { uniqueCode: "" }
            ]
        });

        console.log(`Found ${hospitalsWithoutCode.length} hospitals without uniqueCode:`);
        hospitalsWithoutCode.forEach(hospital => {
            console.log(`  - ${hospital.username} (${hospital.email})`);
        });

        // Delete hospitals without uniqueCode
        const result = await hospitalModel.deleteMany({
            $or: [
                { uniqueCode: { $exists: false } },
                { uniqueCode: null },
                { uniqueCode: "" }
            ]
        });

        console.log(`\n✓ Deleted ${result.deletedCount} hospitals without uniqueCode`);

        // Show remaining hospitals
        const remainingHospitals = await hospitalModel.find({});
        console.log(`\n✓ Remaining hospitals: ${remainingHospitals.length}`);
        remainingHospitals.forEach(hospital => {
            console.log(`  - ${hospital.username} (Code: ${hospital.uniqueCode})`);
        });

    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
        process.exit(0);
    }
}

// Run the cleanup
cleanupHospitals();
