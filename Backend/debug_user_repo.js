import { Octokit } from "octokit";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function debugRepo() {
    const owner = 'abi6374';
    const repo = 'VENUSYNC_E210';

    console.log(`Debugging ${owner}/${repo}...`);

    try {
        const { data: repository } = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });
        console.log("✅ Repo Found:", repository.full_name, "Private:", repository.private);

        console.log("\nFetching contributors stats...");
        const stats = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', { owner, repo });
        console.log("Stats Status:", stats.status);
        if (stats.status === 200) {
            console.log("Stats Data Length:", stats.data.length);
            stats.data.forEach(s => {
                console.log(` - ${s.author.login}: ${s.total} commits`);
            });
        }

        console.log("\nFetching PRs...");
        const { data: pulls } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
            owner, repo, state: 'all', per_page: 100
        });
        console.log("PRs Count:", pulls.length);
        pulls.slice(0, 5).forEach(pr => {
            console.log(` - PR #${pr.number} by ${pr.user.login} (${pr.state})`);
        });

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

debugRepo();
