/**
 * ML Bridge - The logic that quantifies the value of work.
 * This logic is designed to remain stable regardless of team size (3 to 50).
 */

import { fetchRepositoryStats } from './services/github.js';

export const calculateImpact = async (project) => {
    // 1. Fetch Real Data from GitHub
    // If no repository is linked, we fall back to simulation (or error handle)
    let stats = [];
    if (project.repository) {
        stats = await fetchRepositoryStats(project.repository, project.members);
    }

    // 2. Process Member Data
    return project.members.map(member => {
        const memberStat = stats.find(s => s.username === member.github.toLowerCase());

        // Defaults if no data found
        const commits = memberStat ? memberStat.commits : 0;
        const prs = memberStat ? memberStat.prs : 0;
        const merged = memberStat ? memberStat.mergedPrs : 0;
        const linesChanged = memberStat ? (memberStat.additions + memberStat.deletions) : 0;

        // --- THE ALGORITHM ---

        // 1. Visibility (Perceived Activity)
        // Heavily weighted by raw volume ("Noise")
        // Normalized 0-100 based on a theoretical max of 50 commits/week
        let visibility = Math.min(100, (commits * 2) + (prs * 5));

        // If no real data, fall back to random for demo purposes BUT clearly mark it?
        // For this user request, we want REAL data. 
        // If repo is connected but stats are 0, it returns 0.
        // If no repo, we might keep the simulation for "Demo Project"?
        // Let's assume if stats are 0, we behave "Honestly" = 0.

        // 2. Impact (True Value)
        // Weighted by merged work (completion) and complexity (lines changed / meaningful chunks)
        // This is a simplified heuristic.
        let impact = Math.min(100, (merged * 15) + (linesChanged / 100));

        // Refine Impact: "Silent Architect" logic
        // If high complexity but low PR count, boost impact
        if (linesChanged > 1000 && prs < 5) {
            impact += 20;
        }

        // Bias check (Simulation of "Noise")
        // If someone has HUGE visibility but 0 merges, impact drops
        if (visibility > 80 && merged === 0) {
            impact /= 2;
        }

        // --- FALLBACK FOR DEMO (If 0 data found) ---
        // If this is a fresh project with no data, give randoms so the UI isn't empty?
        // User asked to "fetch data". Let's provide real data. 
        // If 0, it shows 0.

        return {
            name: member.name,
            visibility: Math.floor(visibility),
            impact: Math.floor(impact),
            role: 'Engineer',
            type: determineType(visibility, impact),
            // debug info
            raw: { commits, prs, merged }
        };
    });
};

const determineType = (vis, imp) => {
    if (imp > 60 && vis < 40) return 'Silent Architect';
    if (vis > 70 && imp < 50) return 'High Visibility'; // "Loud but low impact"
    if (imp > 60 && vis > 60) return 'Core Contributor';
    return 'Contributor';
};

