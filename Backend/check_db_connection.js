
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log("----------------------------------------");
console.log("Testing MongoDB Connection...");
console.log("URI:", process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
console.log("----------------------------------------");

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB!");
        console.log("The application should work with the real database now.");
        console.log("If you are still seeing 'Mock' mode, please restart your backend server because it might have started when the internet was unstable.");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILURE: Could not connect to MongoDB.");
        console.error("Error Code:", err.code);
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);

        if (err.message.includes("ETIMEDOUT")) {
            console.log("\n⚠️  DIAGNOSIS: NETWORK TIMEOUT");
            console.log("This usually means MongoDB Atlas is blocking your IP address.");
            console.log("SOLUTION: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)");
        } else if (err.message.includes("bad auth")) {
            console.log("\n⚠️  DIAGNOSIS: AUTHENTICATION FAILED");
            console.log("Check your username and password in the .env file.");
        }

        process.exit(1);
    });
