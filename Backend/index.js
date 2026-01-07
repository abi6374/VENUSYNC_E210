import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as mlBridge from './ml_bridge.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'Venusync API is online', version: '1.0.0' });
});

// In-memory store for demo (to be replaced with DB)
let projects = [
    { id: '1', name: 'Cloud Infrastructure', members: [] },
    { id: '2', name: 'Mobile App Redesign', members: [] }
];

// Routes
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

app.post('/api/projects', (req, res) => {
    const newProject = { id: Date.now().toString(), ...req.body };
    projects.push(newProject);
    res.status(201).json(newProject);
});

app.get('/api/analytics/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const project = projects.find(p => p.id === projectId);

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Simulate calling the ML logic
    const analytics = await mlBridge.calculateImpact(project);
    res.json(analytics);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Venusync Server running on port ${PORT}`);
});
