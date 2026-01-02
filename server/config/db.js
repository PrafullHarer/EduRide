const mongoose = require('mongoose');

// Cache the connection for serverless environments
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, return the existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // If connection is in progress, wait for it
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName: 'school_bus_buddy'
        };

        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error:', e.message);
        // Don't exit process in serverless environment
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
