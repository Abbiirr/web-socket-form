# Web Socket Form - Integration Verification

A web-based form application that integrates with an API endpoint and establishes a WebSocket connection with automatic retry logic.

## Features

- Form submission to REST API endpoint
- Automatic 30-second wait after successful API response
- WebSocket connection establishment
- Retry logic: 3 attempts with 30-second delays between each attempt
- Real-time status updates and activity logging
- Progress bar visualization during wait periods
- Comprehensive error handling

## Project Structure

```
web-socket-form/
├── index.html       # Main HTML form
├── app.js          # JavaScript logic for API calls and WebSocket
├── styles.css      # Styling for the application
└── README.md       # This file
```

## How It Works

### Flow

1. **Form Submission**: User fills out the form and clicks "Submit"
2. **API Call**: Application sends POST request to `/api/v1/common/private/integration/verify`
3. **Wait Period**: If API succeeds, wait 30 seconds (with progress bar)
4. **WebSocket Connection**: Attempt to connect to `/ws/register` endpoint
5. **Retry Logic**: If WebSocket fails:
   - Wait 30 seconds
   - Retry connection (up to 3 total attempts)
   - If all attempts fail, display error message

### API Integration

The form submits data to:
```
POST http://localhost:8080/api/v1/common/private/integration/verify
```

Required Headers:
- `accept: */*`
- `X-Subject: <subject-id>`
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

Payload Structure:
```json
{
  "data": {
    "platform": "jobstreet",
    "strategy": "USERNAME_PASSWORD",
    "platformMetadata": {
      "username": "user@example.com",
      "password": "password",
      "team_name": "Team Name",
      "team_id": "12345"
    },
    "strategyMetadata": {
      "loginUrl": "https://example.com/login",
      "description": "Login description"
    }
  }
}
```

### WebSocket Connection

After successful API response, the application connects to:
```
ws://localhost:8080/ws/register
```

The WebSocket connection includes:
- 10-second connection timeout
- Automatic message logging
- Event handlers for open, message, error, and close events

## Usage

1. **Open the Application**
   ```bash
   # Simply open index.html in a web browser
   open index.html
   ```

2. **Configure the Form**
   - Fill in or verify all form fields
   - Update the API URL if different from `http://localhost:8080`
   - Ensure the Authorization token and X-Subject are correct

3. **Submit the Form**
   - Click the "Submit" button
   - Watch the activity log for real-time updates
   - Monitor the progress bar during wait periods

## Form Fields

### Platform Information
- **Platform**: Integration platform (default: jobstreet)
- **Strategy**: Authentication strategy (default: USERNAME_PASSWORD)

### Platform Metadata
- **Username/Email**: Login credentials
- **Password**: User password
- **Team Name**: Organization team name
- **Team ID**: Unique team identifier

### Strategy Metadata
- **Login URL**: Platform login endpoint
- **Description**: Authentication method description

### Authentication
- **X-Subject**: Subject identifier for the request
- **Authorization Token**: Bearer token for API authentication
- **API URL**: Base URL of the API server

## Status Indicators

The application provides visual feedback through:

- **Info Messages**: Blue background - operation in progress
- **Success Messages**: Green background - operation completed successfully
- **Warning Messages**: Orange background - retrying operation
- **Error Messages**: Red background - operation failed

## Activity Log

The activity log shows:
- Timestamp for each event
- Color-coded entries (info, success, warning, error)
- Detailed messages for API calls, WebSocket events, and errors
- Automatic scrolling with the most recent entries at the top

## Requirements

- Modern web browser with WebSocket support
- Access to the API server (default: localhost:8080)
- Valid authentication credentials

## Development

To modify the application:

1. **HTML (index.html)**: Update form fields or structure
2. **JavaScript (app.js)**: Modify API calls, WebSocket logic, or retry behavior
3. **CSS (styles.css)**: Change styling and visual appearance

## Configuration

You can modify the following constants in `app.js`:

```javascript
const WS_MAX_RETRIES = 3;           // Maximum WebSocket retry attempts
const WS_RETRY_DELAY = 30000;       // Delay between retries (ms)
const POST_API_DELAY = 30000;       // Delay after API success (ms)
```

## Troubleshooting

### API Call Fails
- Verify the API URL is correct
- Check that the authorization token is valid
- Ensure the API server is running
- Review CORS settings on the API server

### WebSocket Connection Fails
- Confirm the WebSocket endpoint is available
- Check browser console for detailed error messages
- Verify network connectivity
- Ensure the API server supports WebSocket connections

### Form Not Submitting
- Check browser console for JavaScript errors
- Verify all required fields are filled
- Ensure the form is loaded completely

## Browser Compatibility

Tested and compatible with:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is provided as-is for integration verification purposes.
