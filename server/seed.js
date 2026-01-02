require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Driver = require('./models/Driver');
const Subscription = require('./models/Subscription');
const Payment = require('./models/Payment');
const DutySchedule = require('./models/DutySchedule');

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Student.deleteMany({}),
            Bus.deleteMany({}),
            Route.deleteMany({}),
            Driver.deleteMany({}),
            Subscription.deleteMany({}),
            Payment.deleteMany({}),
            DutySchedule.deleteMany({})
        ]);

        console.log('Cleared existing data');

        // Create demo users (password will be hashed by pre-save hook)
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@school.edu',
            password: 'admin123',
            role: 'admin'
        });

        const studentUser = await User.create({
            name: 'Demo Student',
            email: 'student@school.edu',
            password: 'password123',
            role: 'student'
        });

        const driverUser = await User.create({
            name: 'Demo Driver',
            email: 'driver@school.edu',
            password: 'driver123',
            role: 'driver'
        });

        console.log('Created demo users');

        // Create minimal linked records for the demo users to function properly

        // Create a basic student record (required for student dashboard to work)
        await Student.create({
            userId: studentUser._id,
            name: 'Demo Student',
            email: 'student@school.edu',
            phone: '+91 00000 00000',
            class: '10',
            section: 'A',
            address: 'Demo Address',
            distanceKm: 10,
            enrollmentDate: new Date(),
            status: 'active'
        });

        // Create a basic driver record (required for driver dashboard to work)
        await Driver.create({
            userId: driverUser._id,
            name: 'Demo Driver',
            email: 'driver@school.edu',
            phone: '+91 00000 00000',
            licenseNumber: 'DL-0000000000',
            status: 'off-duty',
            joinDate: new Date(),
            experience: 0
        });

        console.log('Created linked records for demo users');

        console.log('\n✅ Database seeded with demo users successfully!');
        console.log('\nDemo Accounts:');
        console.log('  Admin:   admin@school.edu / admin123');
        console.log('  Student: student@school.edu / password123');
        console.log('  Driver:  driver@school.edu / driver123');
        console.log('\nNote: No buses, routes, or other data created. Use the app to add them.');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
