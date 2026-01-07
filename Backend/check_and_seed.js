
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

console.log("Checking DB for projects...");

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
})
    .then(async () => {
        console.log('Connected.');
        const count = await Project.countDocuments();
        console.log(`Found ${count} projects.`);
        if (count === 0) {
            console.log("Database is empty. Attempting to seed...");
            const dummyProjects = [
                {
                    name: "FinTech Dashboard",
                    repository: "facebook/react",
                    members: [
                        { name: "Alice Chen", github: "acdlite", slack: "U12345" },
                        { name: "Bob Smith", github: "gaearon", slack: "U67890" },
                        { name: "Charlie Kim", github: "sophiebits", slack: "U54321" },
                        { name: "David Lee", github: "bvaughn", slack: "U98765" }
                    ]
                },
                {
                    name: "HealthCare AI",
                    repository: "tensorflow/tensorflow",
                    members: [
                        { name: "Eve Polastri", github: "fchollet", slack: "U11223" },
                        { name: "Villanelle Astankova", github: "martinwicke", slack: "U33445" },
                        { name: "Carolyn Martens", github: "yifeif", slack: "U55667" }
                    ]
                }
            ];
            await Project.insertMany(dummyProjects);
            console.log("Seeding complete.");
        } else {
            const projects = await Project.find({}, 'name repository');
            console.log("Projects found:", projects);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
