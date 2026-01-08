import { Octokit } from "octokit";
import dotenv from 'dotenv';
dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'venusync-backend/1.0.0'
});

export const verifyRepository = async (repoPath) => {
    try {
        const [owner, repo] = repoPath.split('/');
        await octokit.request('GET /repos/{owner}/{repo}', {
            owner,
            repo
        });
        return true;
    } catch (error) {
        console.error(`Repository verification failed for ${repoPath}:`, error.message);
        return false;
    }
};

export const fetchRepositoryStats = async (repoUrl, members) => {
    try {
        // Parse owner/repo from URL or string
        const cleanRepo = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
        const [owner, repo] = cleanRepo.split('/');

        if (!owner || !repo) {
            throw new Error('Invalid repository format. Use owner/repo');
        }

        console.log(`Fetching stats for ${owner}/${repo}`);

        // Helper to fetch with retry for 202 (Computing)
        const fetchWithRetry = async (route, params, retries = 5) => {
            try {
                const response = await octokit.request(route, params);
                if (response.status === 202) {
                    if (retries > 0) {
                        console.log(`GitHub is computing stats for ${route}, waiting...`);
                        await new Promise(r => setTimeout(r, 2000));
                        return fetchWithRetry(route, params, retries - 1);
                    }
                    return { data: [] }; // Give up
                }
                return response;
            } catch (err) {
                console.warn(`Failed to fetch ${route}:`, err.message);
                return { data: [] };
            }
        };

        // 1. Fetch Contributors Stats (Weekly commits)
        const { data: contributorsStats } = await fetchWithRetry('GET /repos/{owner}/{repo}/stats/contributors', {
            owner,
            repo
        });

        // 2. Fetch Pull Requests (Last 100)
        // PRs usually don't need 202 handling
        let pulls = [];
        try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner,
                repo,
                state: 'all',
                per_page: 100
            });
            pulls = data;
        } catch (err) {
            console.warn("Failed to fetch PRs:", err.message);
        }

        // 3. Map stats to our members
        const availableLogins = Array.isArray(contributorsStats)
            ? contributorsStats.map(s => s.author?.login.toLowerCase())
            : [];

        console.log(`Available Logins in Repo: [${availableLogins.join(', ')}]`);

        const memberStats = members.map(member => {
            const githubUser = member.github ? member.github.toLowerCase().trim() : '';

            if (!githubUser) return {
                username: 'unknown', commits: 0, prs: 0, mergedPrs: 0, additions: 0, deletions: 0
            };

            // Find contributor stats
            const userStat = Array.isArray(contributorsStats)
                ? contributorsStats.find(s => s.author && s.author.login.toLowerCase() === githubUser)
                : null;

            if (!userStat) {
                console.warn(`⚠️ No match found for user: "${githubUser}". (Searched in ${availableLogins.length} contributors)`);
            }

            const totalCommits = userStat ? userStat.total : 0;

            // Analyze PRs
            const userPRs = pulls.filter(pr => pr.user && pr.user.login.toLowerCase() === githubUser);
            const mergedPRs = userPRs.filter(pr => pr.merged_at).length;

            return {
                username: githubUser,
                commits: totalCommits,
                prs: userPRs.length,
                mergedPrs: mergedPRs,
                additions: userStat ? userStat.weeks.reduce((acc, w) => acc + w.a, 0) : 0,
                deletions: userStat ? userStat.weeks.reduce((acc, w) => acc + w.d, 0) : 0,
            };
        });

        return memberStats;

    } catch (error) {
        console.error("GitHub API Error:", error.message);
        // Fallback: return zeroed stats
        return members.map(m => ({ username: m.github || '', commits: 0, prs: 0, mergedPrs: 0, additions: 0, deletions: 0 }));
    }
};
