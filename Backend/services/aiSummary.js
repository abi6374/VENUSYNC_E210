import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// You can use Hugging Face Inference API or OpenAI
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const INFERENCE_ENDPOINT = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

/**
 * Generate AI-powered developer summary using DORA metrics and SPACE framework
 * @param {Object} memberData - Complete member analytics data
 * @returns {Promise<string>} - AI-generated summary
 */
export const generateDeveloperSummary = async (memberData) => {
    try {
        const { name, github, impact, visibility, raw, mlFeatures, indicators, role } = memberData;

        // Build comprehensive context for the LLM
        const prompt = `You are an expert engineering manager analyzing developer productivity using DORA metrics and the SPACE framework.

**Developer Profile:**
- Name: ${name}
- GitHub: @${github}
- Role: ${role || 'Developer'}
- AI Productivity Score: ${impact}%

**DORA Metrics (DevOps Research and Assessment):**
- Deployment Frequency: ${mlFeatures?.commits_per_day || 0} commits/day
- Lead Time for Changes: Based on ${raw?.prs || 0} pull requests
- Change Failure Rate: ${raw?.merged || 0} merged PRs out of ${raw?.prs || 0} total
- Time to Restore: Cycle efficiency indicated by ${mlFeatures?.issues_closed_per_week || 0} issues/week

**SPACE Framework Analysis:**
1. **Satisfaction & Well-being**: Productivity score of ${impact}% indicates ${impact > 70 ? 'high engagement' : impact > 50 ? 'moderate engagement' : 'potential burnout risk'}
2. **Performance**: ${raw?.commits || 0} commits, ${raw?.prs || 0} PRs, ${raw?.additions || 0} lines added, ${raw?.deletions || 0} lines removed
3. **Activity**: ${mlFeatures?.daily_coding_hours || 0} hours/day coding, ${mlFeatures?.code_reviews_per_week || 0} reviews/week
4. **Communication & Collaboration**: ${mlFeatures?.pull_requests_per_week || 0} PRs/week, ${indicators?.active_pr_process ? 'Active' : 'Developing'} PR workflow
5. **Efficiency & Flow**: ${indicators?.high_commit_frequency ? 'High' : 'Standard'} commit frequency, ${indicators?.good_issue_resolution ? 'Efficient' : 'Under Review'} issue resolution

**Current Status:**
- Commit Frequency: ${indicators?.high_commit_frequency ? '✓ High' : '○ Standard'}
- PR Process: ${indicators?.active_pr_process ? '✓ Active' : '○ Developing'}
- Issue Resolution: ${indicators?.good_issue_resolution ? '✓ Efficient' : '⚠ Under Review'}

Generate a concise, actionable 3-paragraph summary (max 150 words) that:
1. Highlights this developer's key strengths based on DORA and SPACE metrics
2. Identifies one area for improvement or growth opportunity
3. Provides a specific, actionable recommendation for the engineering manager

Use a professional, supportive tone. Focus on data-driven insights.`;

        const response = await axios.post(
            INFERENCE_ENDPOINT,
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const generatedText = response.data[0]?.generated_text || response.data.generated_text || '';

        // Clean up the response
        const summary = generatedText
            .replace(/^[\s\n]+/, '')
            .replace(/[\s\n]+$/, '')
            .trim();

        return summary || generateFallbackSummary(memberData);

    } catch (error) {
        console.error('[AI Summary] Error generating summary:', error.message);
        return generateFallbackSummary(memberData);
    }
};

/**
 * Fallback summary generator if LLM API fails
 */
const generateFallbackSummary = (memberData) => {
    const { name, impact, raw, indicators } = memberData;

    let summary = `${name} demonstrates `;

    if (impact > 70) {
        summary += `exceptional productivity with a ${impact}% AI score. Strong performance across ${raw?.commits || 0} commits and ${raw?.prs || 0} PRs. `;
    } else if (impact > 50) {
        summary += `solid productivity with a ${impact}% AI score. Consistent contributions with ${raw?.commits || 0} commits. `;
    } else {
        summary += `developing productivity patterns with a ${impact}% AI score. Building momentum with ${raw?.commits || 0} commits. `;
    }

    if (indicators?.high_commit_frequency && indicators?.active_pr_process) {
        summary += `Excels in both commit frequency and PR collaboration. `;
    } else if (!indicators?.good_issue_resolution) {
        summary += `Opportunity to improve issue resolution efficiency through focused sprint planning. `;
    }

    summary += `Recommended action: ${impact > 70 ? 'Mentor junior developers to scale impact.' : 'Pair programming sessions to accelerate growth.'}`;

    return summary;
};
