import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing connection to:', process.env.MONGODB_URI.split('@')[1]); // Log host only for safety

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.reason) console.error('Reason:', JSON.stringify(err.reason, null, 2));
        process.exit(1);
    });
