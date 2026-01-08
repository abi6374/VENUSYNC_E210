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
import { verifyRepository } from './services/github.js';
import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// CORS Configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://venusync.netlify.app', 'https://venusync-frontend.netlify.app', 'https://venusync.onrender.com']
        : ['http://localhost:5177', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};


// COOP Header for Google Auth
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

app.use(cors(corsOptions));
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

// Health Check with detailed status
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'Venusync API is online',
        storageMode: User === _User ? 'Atlas Database (Real)' : 'Local MockStore (Offline)',
        database: dbStatus,
        version: '1.0.1',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        storageMode: User === _User ? 'Atlas Database (Real)' : 'Local MockStore (Offline)',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
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

app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Auto-register if user doesn't exist
            user = new User({
                name,
                email,
                role: 'Manager', // Default role for Google signups
                password: Math.random().toString(36).slice(-8) // Random password for DB consistency
            });
            await user.save();
        }

        res.json({ name: user.name, role: user.role, email: user.email, picture });
    } catch (error) {
        console.error('❌ Google Auth Error:', error.message);
        res.status(500).json({ error: 'Google authentication failed', details: error.message });
    }
});

// Project Routes
let DUMMY_PROJECTS = [
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
        createdAt: new Date(),
        status: 'active'
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
            console.error("Project not found in DB:", projectId);
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log(`✅ Project ${projectId} updated successfully in MongoDB`);
        res.json(project);
    } catch (error) {
        console.error('❌ Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:projectId', async (req, res) => {
    const { projectId } = req.params;
    console.log(`[DELETE] Request for project: ${projectId}`);
    try {
        // 1. Check if it's a dummy project in memory
        const dummyIndex = DUMMY_PROJECTS.findIndex(p => p._id === projectId);
        if (dummyIndex !== -1) {
            console.log("Removing dummy project from server memory...");
            DUMMY_PROJECTS.splice(dummyIndex, 1);
            return res.json({ message: 'Dummy project removed' });
        }

        // 2. Try DB/MockStore
        console.log("Attempting removal from DB or MockStore...");

        let project;
        try {
            project = await Project.findByIdAndDelete(projectId);
        } catch (err) {
            if (err.name === 'CastError' || err.kind === 'ObjectId') {
                console.error("Invalid project ID format:", projectId);
                return res.status(404).json({ error: 'Project not found (Invalid ID format)' });
            }
            throw err;
        }

        if (!project) {
            console.error("Project ID not found in DB or MockStore:", projectId);
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log("✅ Deletion successful");
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('❌ Delete route error:', error);
        res.status(500).json({ error: 'Failed to delete project', details: error.message });
    }
});

app.patch('/api/projects/:projectId/status', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;

        // Check dummy projects
        const dummyIndex = DUMMY_PROJECTS.findIndex(p => p._id === projectId);
        if (dummyIndex !== -1) {
            DUMMY_PROJECTS[dummyIndex].status = status;
            return res.json(DUMMY_PROJECTS[dummyIndex]);
        }

        const project = await Project.findByIdAndUpdate(projectId, { status }, { new: true });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: 'Failed to update project status' });
    }
});

app.get('/api/analytics/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log(`[Analytics] Request for project: ${projectId}`);

        let project = DUMMY_PROJECTS.find(p => p._id === projectId);

        if (!project) {
            project = await Project.findById(projectId);
        }

        if (!project) {
            console.error(`[Analytics] Project NOT FOUND: ${projectId}`);
            return res.status(404).json({ error: 'Project not found' });
        }

        // Optimization: For dummy projects, return pre-defined mock analytics to avoid ML bridge timeouts
        if (projectId.startsWith('65e00000')) {
            console.log(`[Analytics] Returning mock data for dummy project: ${project.name}`);
            const mockAnalysis = {
                members: project.members.map((m, i) => ({
                    name: m.name,
                    github: m.github,
                    visibility: 70 - (i * 10),
                    impact: 85 - (i * 5),
                    role: i === 0 ? 'Lead Engineer' : 'Developer',
                    type: i === 0 ? 'Core Contributor' : (i === 1 ? 'Silent Architect' : 'Contributor'),
                    raw: { commits: 45 - i * 5, prs: 12 - i, merged: 10 - i, additions: 1200, deletions: 300 },
                    mlFeatures: { daily_coding_hours: 6.5, commits_per_day: 1.2, pull_requests_per_week: 2, issues_closed_per_week: 1.5, active_repos: 3, code_reviews_per_week: 4 }
                })),
                repoStats: { predicted_score: 0.88, total_commits: 156, pr_merge_rate: 0.92, avg_pr_size: 450, avg_cycle_time_hrs: 24, prs_total: 45, prs_merged: 41, authors: project.members.length, productivity_indicators: { overall_productivity: true, high_commit_frequency: true, active_pr_process: true, good_issue_resolution: true } }
            };
            return res.json(mockAnalysis);
        }

        // Simulate calling the ML logic
        console.log(`[Analytics] Calling ML Bridge for: ${project.name} (${project.repository})`);
        const analysis = await mlBridge.calculateImpact(project);

        // PERSISTENCE: Store the results in the database if it's a real project
        if (!projectId.startsWith('65e00000')) {
            try {
                await Project.findByIdAndUpdate(projectId, {
                    lastAnalytics: analysis,
                    lastSync: new Date().toLocaleString()
                });
                console.log(`[Analytics] Successfully cached results for ${project.name} in DB`);
            } catch (dbErr) {
                console.warn(`[Analytics] Failed to cache results to DB: ${dbErr.message}`);
            }
        }

        res.json(analysis);
    } catch (error) {
        console.error('Error fetching analytics:', error);

        // FALLBACK: If live fetch fails, try to return the cached results from the DB
        try {
            const { projectId } = req.params;
            const project = await Project.findById(projectId);
            if (project && project.lastAnalytics) {
                console.log(`[Analytics] Live fetch failed, returning CACHED results for ${project.name}`);
                return res.json(project.lastAnalytics);
            }
        } catch (fallbackErr) {
            console.error('[Analytics] Fallback also failed');
        }

        res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    }
});

// AI Summary Generation Endpoint
app.post('/api/analytics/member-summary', async (req, res) => {
    try {
        const memberData = req.body;

        if (!memberData || !memberData.name) {
            return res.status(400).json({ error: 'Member data is required' });
        }

        const { generateDeveloperSummary } = await import('./services/aiSummary.js');
        const summary = await generateDeveloperSummary(memberData);

        res.json({ summary });
    } catch (error) {
        console.error('Error generating AI summary:', error);
        res.status(500).json({
            error: 'Failed to generate summary',
            summary: `${memberData?.name || 'This developer'} shows consistent contribution patterns. Recommended: Continue current trajectory with focus on code review participation.`
        });
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
