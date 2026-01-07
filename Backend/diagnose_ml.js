import axios from 'axios';

const ML_MODEL_URL = 'https://abinivas8-devpro.hf.space/predict';

async function testML() {
    const payload = {
        "daily_coding_hours": 4.0,
        "commits_per_day": 5,
        "pull_requests_per_week": 4,
        "issues_closed_per_week": 3,
        "active_repos": 5,
        "code_reviews_per_week": 3
    };

    try {
        console.log("Testing Hugging Face ML Model at:", ML_MODEL_URL);
        console.log("Sending payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(ML_MODEL_URL, payload);

        console.log("✅ ML Model Response received!");
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error("❌ ML Model Error:", err.message);
        if (err.response) {
            console.error("Response Data:", err.response.data);
            console.error("Response Status:", err.response.status);
        }
    }
}

testML();
