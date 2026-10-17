
const generateButton = document.getElementById('generate-insights');
const statusElement = document.getElementById('insights-status');
const resultElement = document.getElementById('insights-result');

generateButton.addEventListener('click', async () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating insights...';
    statusElement.textContent = 'Analyzing your current-month finances...';
    resultElement.textContent = '';
    try {
        const response = await fetch('/ai-insights/test', {
            method: 'POST'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate insights.');
        }
        resultElement.innerHTML = DOMPurify.sanitize(
            marked.parse(data.insights || '')
        );
        statusElement.textContent = 'Your financial insights are ready!';
    } catch (error) {
        console.error('AI insights error:', error);
        statusElement.textContent = error.message || 'Something went wrong. Please try again.';
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Insights';
    }
});
