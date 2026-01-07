import { Octokit } from "octokit";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.GITHUB_TOKEN;
console.log("Token detected:", token ? token.substring(0, 10) + "..." : "MISSING");

const octokit = new Octokit({ auth: token });

async function test() {
    try {
        console.log("Testing GitHub connection with 'facebook/react'...");
        const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
            owner: 'facebook',
            repo: 'react'
        });
        console.log("✅ Success! Repository found:", data.full_name);
        console.log("Description:", data.description);
        console.log("Stars:", data.stargazers_count);

        console.log("\nTesting stats fetching...");
        const stats = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
            owner: 'facebook',
            repo: 'react'
        });

        if (stats.status === 202) {
            console.log("⚠️ GitHub is computing stats (202). Try again in a few seconds.");
        } else {
            console.log("✅ Stats received. Top contributor:", stats.data[stats.data.length - 1]?.author?.login);
        }

    } catch (err) {
        console.error("❌ GitHub Error:", err.message);
        if (err.status === 401) console.error("   Invalid Token.");
        if (err.status === 404) console.error("   Repository not found or hidden.");
    }
}

test();
