// DOM Elements
const form = document.getElementById('integrationForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const logMessages = document.getElementById('logMessages');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Configuration
const WS_MAX_RETRIES = 3;
const WS_RETRY_DELAY = 30000; // 30 seconds
const POST_API_DELAY = 30000; // 30 seconds after successful API response

// State
let websocket = null;

// Utility Functions
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
    logMessages.insertBefore(logEntry, logMessages.firstChild);
}

function updateStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    addLog(message, type);
}

function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtn.textContent = 'Processing...';
        submitBtn.classList.add('loading');
    } else {
        submitBtn.textContent = 'Submit';
        submitBtn.classList.remove('loading');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showProgress(duration, message) {
    progressBar.style.display = 'block';
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';

    updateStatus(message, 'info');

    // Force reflow
    progressFill.offsetHeight;

    progressFill.style.transition = `width ${duration}ms linear`;
    progressFill.style.width = '100%';

    return sleep(duration).then(() => {
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    });
}

// API Functions
async function submitToAPI(formData) {
    const apiUrl = formData.get('apiUrl');
    const endpoint = `${apiUrl}/api/v1/common/private/integration/verify`;

    const payload = {
        data: {
            platform: formData.get('platform'),
            strategy: formData.get('strategy'),
            platformMetadata: {
                username: formData.get('username'),
                password: formData.get('password'),
                team_name: formData.get('teamName'),
                team_id: formData.get('teamId')
            },
            strategyMetadata: {
                loginUrl: formData.get('loginUrl'),
                description: formData.get('description')
            }
        }
    };

    const headers = {
        'accept': '*/*',
        'X-Subject': formData.get('xSubject'),
        'Authorization': `Bearer ${formData.get('authToken')}`,
        'Content-Type': 'application/json'
    };

    addLog(`Sending POST request to ${endpoint}`, 'info');

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
        }

        addLog(`API Response: ${JSON.stringify(responseData)}`, 'success');
        return { success: true, data: responseData };
    } catch (error) {
        addLog(`API Error: ${error.message}`, 'error');
        throw error;
    }
}

// WebSocket Functions
function connectWebSocket(apiUrl, attempt = 1) {
    return new Promise((resolve, reject) => {
        const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsEndpoint = `${wsUrl}/ws/register`;

        addLog(`Attempting WebSocket connection (Attempt ${attempt}/${WS_MAX_RETRIES}) to ${wsEndpoint}`, 'info');

        try {
            websocket = new WebSocket(wsEndpoint);

            const connectionTimeout = setTimeout(() => {
                if (websocket.readyState !== WebSocket.OPEN) {
                    websocket.close();
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000); // 10 second timeout for connection

            websocket.onopen = () => {
                clearTimeout(connectionTimeout);
                addLog('WebSocket connection established successfully', 'success');
                resolve({ success: true, websocket });
            };

            websocket.onmessage = (event) => {
                addLog(`WebSocket Message: ${event.data}`, 'success');
                try {
                    const data = JSON.parse(event.data);
                    addLog(`Parsed WebSocket Data: ${JSON.stringify(data, null, 2)}`, 'info');
                } catch (e) {
                    // Message is not JSON, just display as is
                }
            };

            websocket.onerror = (error) => {
                clearTimeout(connectionTimeout);
                addLog(`WebSocket error: ${error.message || 'Connection failed'}`, 'error');
                reject(new Error('WebSocket connection failed'));
            };

            websocket.onclose = (event) => {
                clearTimeout(connectionTimeout);
                addLog(`WebSocket closed: Code ${event.code}, Reason: ${event.reason || 'No reason provided'}`, 'warning');
            };

        } catch (error) {
            addLog(`WebSocket connection error: ${error.message}`, 'error');
            reject(error);
        }
    });
}

async function attemptWebSocketConnection(apiUrl) {
    for (let attempt = 1; attempt <= WS_MAX_RETRIES; attempt++) {
        try {
            const result = await connectWebSocket(apiUrl, attempt);
            updateStatus('WebSocket connection established successfully!', 'success');
            return result;
        } catch (error) {
            if (attempt < WS_MAX_RETRIES) {
                const waitTime = WS_RETRY_DELAY / 1000;
                updateStatus(`WebSocket connection failed. Retrying in ${waitTime} seconds... (Attempt ${attempt}/${WS_MAX_RETRIES})`, 'warning');
                await showProgress(WS_RETRY_DELAY, `Waiting ${waitTime} seconds before retry ${attempt + 1}/${WS_MAX_RETRIES}...`);
            } else {
                updateStatus('WebSocket connection failed after all retry attempts', 'error');
                throw new Error('Failed to establish WebSocket connection after 3 attempts');
            }
        }
    }
}

// Form Submission Handler
async function handleFormSubmit(event) {
    event.preventDefault();

    // Clear previous logs
    logMessages.innerHTML = '';

    setLoading(true);
    updateStatus('Starting integration verification process...', 'info');

    const formData = new FormData(form);
    const apiUrl = formData.get('apiUrl');

    try {
        // Step 1: Submit to API
        updateStatus('Step 1: Submitting to API...', 'info');
        const apiResult = await submitToAPI(formData);
        updateStatus('API request successful!', 'success');

        // Step 2: Wait 30 seconds
        updateStatus('Step 2: Waiting 30 seconds before WebSocket connection...', 'info');
        await showProgress(POST_API_DELAY, 'Waiting 30 seconds before establishing WebSocket connection...');

        // Step 3: Attempt WebSocket connection with retries
        updateStatus('Step 3: Establishing WebSocket connection...', 'info');
        const wsResult = await attemptWebSocketConnection(apiUrl);

        updateStatus('Integration verification completed successfully!', 'success');

    } catch (error) {
        updateStatus(`Integration verification failed: ${error.message}`, 'error');
        addLog(`Process failed: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

// Event Listeners
form.addEventListener('submit', handleFormSubmit);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
    }
});

// Initial log
addLog('Form initialized and ready', 'success');
