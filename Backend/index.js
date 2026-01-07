import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as mlBridge from './ml_bridge.js';
import _User from './models/User.js';
import _Project from './models/Project.js';
import { MockUser, MockProject } from './utils/MockStore.js';

let User = _User;
let Project = _Project;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
// Also look for .env in the same directory as index.js if root .env wasn't enough
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            family: 4
        });
        console.log('✅ MongoDB Connected Successfully: USING LIVE DATABASE');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);

        if (err.message.includes('whitelist') || err.message.includes('IP')) {
            console.error('👉 ACTION REQUIRED: Your current IP address is likely not whitelisted in MongoDB Atlas.');
            console.error('   Please go to MongoDB Atlas Network Access and add "0.0.0.0/0" for testing or your specific IP.');
        }

        if (process.env.NODE_ENV === 'production') {
            console.error('🚨 CRITICAL: Failed to connect to DB in PRODUCTION mode. App may not function correctly.');
            // In production, we don't fall back to mock unless explicitly wanted
        } else {
            console.log('⚠️  FALLBACK: Running in OFFLINE MODE - Data will NOT be saved to MongoDB Atlas.');
            User = MockUser;
            Project = MockProject;
        }
    }
};

connectDB();

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'Venusync API is online', version: '1.0.0' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ name, email, password, role });
        await newUser.save();

        res.status(201).json({ name: newUser.name, role: newUser.role });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            details: error.message,
            mode: User === _User ? 'Mongo' : 'Mock'
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({ name: user.name, role: user.role });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Project Routes
const DUMMY_PROJECTS = [
    {
        _id: '65e000000000000000000001',
        name: 'Venusync Core',
        repository: 'abi6374/VENUSYNC_E210',
        members: [
            { name: 'Priya (Lead)', github: 'kungumapriyaa' },
            { name: 'Abi (Dev)', github: 'abi6374' },
            { name: 'John (Engineer)', github: 'john-doe-dummy' }
        ],
        lastSync: 'Recently',
        createdAt: new Date()
    },
    {
        _id: '65e000000000000000000002',
        name: 'React OS Ecosystem',
        repository: 'facebook/react',
        members: [
            { name: 'Dan Abramov', github: 'gaearon' },
            { name: 'Sophie Alpert', github: 'sophiebits' },
            { name: 'Andrew Clark', github: 'acdlite' },
            { name: 'Brian Vaughn', github: 'bvaughn' },
            { name: 'Sebastian Markbåge', github: 'sebmarkbage' },
            { name: 'Rachel Nabors', github: 'rachelnabors' },
            { name: 'Luna Helmer', github: 'luna' }
        ],
        lastSync: 'Recently',
        createdAt: new Date()
    }
];

app.get('/api/projects', async (req, res) => {
    try {
        const dbProjects = await Project.find().sort({ createdAt: -1 });
        // Merge hardcoded projects with DB projects
        res.json([...DUMMY_PROJECTS, ...dbProjects]);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { name, members, repository } = req.body;
        const newProject = new Project({ name, members, repository });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.get('/api/projects/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const dummy = DUMMY_PROJECTS.find(p => p._id === projectId);
        if (dummy) return res.json(dummy);

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

app.put('/api/projects/:projectId', async (req, res) => {
    console.log("---------------------------------------------------------");
    console.log(`[PUT] Updating project members for: ${req.params.projectId}`);

    try {
        const { projectId } = req.params;
        const { members } = req.body;
        console.log("Receiving Members Payload:", JSON.stringify(members, null, 2));

        if (!members) {
            console.error("Missing members in body");
            return res.status(400).json({ error: "Missing members in body" });
        }

        // Check if it's a dummy project
        const dummyIndex = DUMMY_PROJECTS.findIndex(p => p._id === projectId);
        if (dummyIndex !== -1) {
            console.log("Updating DUMMY project in memory...");
            DUMMY_PROJECTS[dummyIndex].members = members;
            return res.json(DUMMY_PROJECTS[dummyIndex]);
        }

        const project = await Project.findByIdAndUpdate(
            projectId,
            { members },
            { new: true }
        );

        if (!project) {
            console.error("Project not found in DB");
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log("✅ Project updated successfully");
        res.json(project);
    } catch (error) {
        console.error('❌ Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.get('/api/analytics/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        let project = DUMMY_PROJECTS.find(p => p._id === projectId);

        if (!project) {
            project = await Project.findById(projectId);
        }

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Simulate calling the ML logic
        const analyzedMembers = await mlBridge.calculateImpact(project);
        res.json({ members: analyzedMembers });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../Frontend/dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Venusync Server running on port ${PORT}`);
});
