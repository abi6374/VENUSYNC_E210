/**
 * ML Bridge - The logic that quantifies the value of work.
 * Now integrated with Hugging Face Predictive Model.
 */

import { fetchRepositoryStats } from './services/github.js';
import axios from 'axios';

const ML_MODEL_URL = 'https://abinivas8-devpro.hf.space/predict';

export const calculateImpact = async (project) => {
    // 1. Fetch Real Data from GitHub
    let stats = [];
    let isDummy = project._id && project._id.toString().startsWith('65e000000000');

    if (project.repository) {
        stats = await fetchRepositoryStats(project.repository, project.members);
    }

    // 2. Process Member Data through ML Model
    const memberPromises = project.members.map(async (member, idx) => {
        let memberStat = stats.find(s => s.username === (member.github || '').toLowerCase());

        // --- DATA PREP FOR ML MODEL ---
        // Fetch raw stats or use seeded dummy values for simulation
        const commits = memberStat ? memberStat.commits : (isDummy ? 20 + (idx * 5) : 0);
        const prs = memberStat ? memberStat.prs : (isDummy ? 5 + idx : 0);
        const merged = memberStat ? memberStat.mergedPrs : (isDummy ? 4 + idx : 0);

        // Construct the payload for Hugging Face model
        const mlFeatures = {
            daily_coding_hours: Math.min(12, (commits * 0.2) + (prs * 1.5) + 2).toFixed(1),
            commits_per_day: Math.ceil(commits / 7) || 1,
            pull_requests_per_week: prs || 1,
            issues_closed_per_week: Math.ceil(merged * 0.8) || 1,
            active_repos: 5, // Theoretical average
            code_reviews_per_week: Math.ceil(prs * 1.2) || 2
        };

        let predictedScore = 50; // Default fallback

        try {
            console.log(`[ML] Calling model for ${member.name}...`);
            // The user provided the list ["daily_coding_hours", ...] which suggests the model expects an array or specific JSON
            // Based on the example provided, we send the JSON object
            const mlResponse = await axios.post(ML_MODEL_URL, mlFeatures, {
                timeout: 5000
            });

            // The model returns: { "predicted_score": 64.4, "status": "success" }
            predictedScore = mlResponse.data.predicted_score || mlResponse.data.prediction || mlResponse.data.score || mlResponse.data[0] || 75;
            console.log(`[ML] ${member.name} Score: ${predictedScore}`);
        } catch (err) {
            console.warn(`[ML] Prediction failed for ${member.name}, using heuristic. Error: ${err.message}`);
            // Heuristic Fallback
            predictedScore = Math.min(100, (commits * 2) + (prs * 10));
        }

        // Map ML prediction to our UI range
        // Scaling: if prediction is 0-1, multiply by 100. If 1-10, multiply by 10.
        let finalImpact = predictedScore;
        if (finalImpact < 1) finalImpact *= 100;
        else if (finalImpact < 10) finalImpact *= 10;

        finalImpact = Math.min(100, Math.floor(finalImpact));
        let finalVisibility = Math.min(100, Math.floor((commits * 3) + (prs * 5)));

        return {
            name: member.name,
            github: member.github,
            visibility: finalVisibility,
            impact: finalImpact,
            role: member.role || 'Engineer',
            type: determineType(finalVisibility, finalImpact),
            raw: { commits, prs, merged }
        };
    });

    return Promise.all(memberPromises);
};

const determineType = (vis, imp) => {
    if (imp > 60 && vis < 40) return 'Silent Architect';
    if (vis > 70 && imp < 50) return 'High Visibility';
    if (imp > 60 && vis > 60) return 'Core Contributor';
    return 'Contributor';
};
