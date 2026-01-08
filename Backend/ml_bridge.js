/**
 * ML Bridge - The logic that quantifies the value of work.
 * Now integrated with Advanced HF Analytics.
 */

import { fetchRepositoryStats } from './services/github.js';
import axios from 'axios';

const ANALYTICS_ENDPOINT = 'https://abinivas8-venusync.hf.space/analyze-github';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Fetches overall project analytics from the new HF model
 */
export const fetchProjectStats = async (repoPath) => {
    try {
        const repoUrl = repoPath.startsWith('http') ? repoPath : `https://github.com/${repoPath}`;
        console.log(`[ML] Fetching repo-wide analytics for: ${repoUrl}`);

        const response = await axios.post(ANALYTICS_ENDPOINT, {
            repo_url: repoUrl,
            github_token: GITHUB_TOKEN
        }, { timeout: 15000 });

        return response.data;
    } catch (err) {
        console.error('[ML] Failed to fetch repo analytics:', err.message);
        return null;
    }
};

export const calculateImpact = async (project) => {
    // 1. Fetch Overall Repo Stats for general context
    const projectAnalytics = await fetchProjectStats(project.repository);

    // 2. Fetch Raw GitHub Stats for all members (Verified baseline)
    const githubStats = await fetchRepositoryStats(project.repository, project.members);

    // 3. Fetch Individual Analysis from the model for each member
    const memberPromises = project.members.map(async (member, idx) => {
        const username = (member.github || '').trim();
        const raw = githubStats.find(s => s.username.toLowerCase() === username.toLowerCase()) ||
            { commits: 0, prs: 0, mergedPrs: 0, additions: 0, deletions: 0 };

        let userModelData = null;
        if (username && !username.includes('dummy')) {
            try {
                console.log(`[ML] Fetching individual analysis for: ${username}`);
                const response = await axios.post(ANALYTICS_ENDPOINT, {
                    repo_url: project.repository.startsWith('http') ? project.repository : `https://github.com/${project.repository}`,
                    github_token: GITHUB_TOKEN,
                    username: username
                }, { timeout: 15000 });
                userModelData = response.data;
            } catch (err) {
                console.warn(`[ML] Model unavailable for ${username}.`);
            }
        }

        // IMPACT: Real model score or 0 if unavailable
        const impact = userModelData?.predicted_score ? Math.floor(userModelData.predicted_score * 100) : 0;

        // FEATURES: Taken directly from model or 0
        const mlFeatures = userModelData?.ml_features || {
            daily_coding_hours: 0,
            commits_per_day: 0,
            pull_requests_per_week: 0,
            issues_closed_per_week: 0,
            active_repos: 0,
            code_reviews_per_week: 0
        };

        // VISIBILITY: Based purely on real activity
        const visibility = Math.min(100, (raw.commits * 3) + (raw.prs * 5));

        return {
            name: member.name,
            github: username,
            visibility,
            impact: impact || visibility, // Use activity-based visibility as impact fallback if model fails
            role: member.role || (idx === 0 ? 'Lead Engineer' : 'Developer'),
            type: determineType(visibility, impact || visibility),
            raw: {
                commits: raw.commits,
                prs: raw.prs,
                merged: raw.mergedPrs,
                additions: raw.additions,
                deletions: raw.deletions
            },
            mlFeatures,
            indicators: userModelData?.productivity_indicators
        };
    });

    const analyzedMembers = await Promise.all(memberPromises);

    return {
        members: analyzedMembers,
        repoStats: projectAnalytics
    };
};

const determineType = (vis, imp) => {
    if (imp > 60 && vis < 40) return 'Silent Architect';
    if (vis > 70 && imp < 50) return 'High Visibility';
    if (imp > 60 && vis > 60) return 'Core Contributor';
    return 'Contributor';
};

