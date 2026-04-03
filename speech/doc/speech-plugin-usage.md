# SpeechPlugin.js API Documentation

This document describes the usage of the `SpeechPlugin` class, which provides a JavaScript API for controlling the speech plugin server and browser interface.

## Overview

The `SpeechPlugin` class is a wrapper around the speech plugin's HTTP REST API and WebSocket server. It provides methods for server lifecycle management, browser control, text-to-speech functionality, and status querying.

## Constructor

### `new SpeechPlugin({ config })`

Creates a new instance of the SpeechPlugin.

**Parameters:**
- `config` (Object): Configuration object containing:
  - `port` (number): Server port (default: 3000)
  - `browser` (string): Browser key (default: "edge")
  - `platform` (string): Platform key (default: "windows")
  - `maxLogLines` (number): Maximum log lines in SPA (default: 15)
  - `browsers` (Object): Browser configuration with run commands
  - `apiKey` (string): API key for speech services

**Example:**
```javascript
import SpeechPlugin from './speech-plugin.js'

const config = {
  port: 3000,
  browser: "edge",
  platform: "windows",
  apiKey: "your-api-key"
}

const speechPlugin = new SpeechPlugin({ config })
```

## Static Methods

### `SpeechPlugin.readConfigFile(configFilePath)`

Reads and parses a JSON configuration file.

**Parameters:**
- `configFilePath` (string): Path to the configuration file

**Returns:**
- Object: Parsed configuration object

**Example:**
```javascript
const config = SpeechPlugin.readConfigFile('./config/config.json')
const plugin = new SpeechPlugin({ config })
```

### `SpeechPlugin.fromDefaultConfigFile()`

Creates a SpeechPlugin instance using the default configuration file.

**Returns:**
- SpeechPlugin: New instance with default config loaded

**Example:**
```javascript
const speechPlugin = SpeechPlugin.fromDefaultConfigFile()
```

## Instance Methods

### Server Lifecycle

#### `async launchServer()`

Starts the speech plugin server if not already running.

**Behavior:**
- Creates a new SpeechServer instance with the current config
- Starts the HTTP and WebSocket servers
- Does nothing if server is already running

**Example:**
```javascript
await speechPlugin.launchServer()
console.log('Server is running')
```

#### `async stopServer()`

Stops the speech plugin server if running.

**Behavior:**
- Stops the HTTP and WebSocket servers
- Clears the server instance
- Does nothing if server is not running

**Example:**
```javascript
await speechPlugin.stopServer()
console.log('Server stopped')
```

### Browser Control

#### `async openBrowser()`

Opens the SPA in the configured browser.

**Behavior:**
- Resolves the appropriate browser command based on platform and browser configuration
- Supports both string and object-based runCommand configurations
- Launches browser in detached mode (doesn't block the process)
- Stores the browser process reference

**Example:**
```javascript
await speechPlugin.openBrowser()
console.log(`Browser opened at ${speechPlugin.spaUrl()}`)
```

### Text-to-Speech

#### `async speak({ sentence, voice, apiKey })`

Speaks a sentence using the speech synthesis API.

**Parameters:**
- `sentence` (string): Text to speak
- `voice` (string): Voice name to use (optional, uses first available if not specified)
- `apiKey` (string): API key override (optional, uses config value if not specified)

**Returns:**
- Object: Response from the speak API

**Behavior:**
- Sends POST request to `/speak` endpoint
- Waits for running status to change to "speaking"
- Waits for running status to return to "idle"
- Throws error if request fails or timeouts occur

**Example:**
```javascript
// Speak with default voice
await speechPlugin.speak({ 
  sentence: "Hello world" 
})

// Speak with specific voice and API key
await speechPlugin.speak({ 
  sentence: "Hello world", 
  voice: "Microsoft Zira Desktop",
  apiKey: "custom-api-key"
})
```

### Status and Capabilities

#### `async getRunningStatus()`

Gets the current running status of the speech plugin.

**Returns:**
- Object: Status information including:
  - `runningStatus` (string): "idle" or "speaking"
  - `voiceCount` (number): Number of available voices
  - Other status properties

**Example:**
```javascript
const status = await speechPlugin.getRunningStatus()
console.log(`Status: ${status.runningStatus}`)
console.log(`Voices available: ${status.voiceCount}`)
```

#### `async getVoices()`

Gets the list of available voices from the server.

**Returns:**
- Object: Capabilities information including:
  - `voiceList` (Array): Array of voice objects with properties like name, lang, etc.

**Example:**
```javascript
const capabilities = await speechPlugin.getVoices()
console.log(`Available voices: ${capabilities.voiceList.length}`)
capabilities.voiceList.forEach(voice => {
  console.log(`- ${voice.name} (${voice.lang})`)
})
```

### Utility Methods

#### `baseUrl()`

Gets the base URL of the server.

**Returns:**
- string: Base URL (e.g., "http://localhost:3000")

**Example:**
```javascript
const url = speechPlugin.baseUrl()
console.log(`Server URL: ${url}`)
```

#### `spaUrl()`

Gets the URL of the SPA.

**Returns:**
- string: SPA URL (e.g., "http://localhost:3000/app/")

**Example:**
```javascript
const spaUrl = speechPlugin.spaUrl()
console.log(`SPA URL: ${spaUrl}`)
```

#### `async waitForRunningStatus({ expected, timeoutMs, pollMs })`

Waits for the running status to match an expected value.

**Parameters:**
- `expected` (string): Expected running status value
- `timeoutMs` (number): Maximum time to wait (default: 30000)
- `pollMs` (number): Polling interval (default: 250)

**Returns:**
- Object: Current status when expected value is reached

**Throws:**
- Error: If timeout is reached

**Example:**
```javascript
// Wait for speech to start
await speechPlugin.waitForRunningStatus({ expected: 'speaking' })

// Wait for speech to complete
await speechPlugin.waitForRunningStatus({ expected: 'idle' })
```

#### `async waitForVoices({ timeoutMs, pollMs })`

Waits for voices to become available.

**Parameters:**
- `timeoutMs` (number): Maximum time to wait (default: 30000)
- `pollMs` (number): Polling interval (default: 500)

**Returns:**
- Array: Array of available voice objects

**Throws:**
- Error: If timeout is reached or no voices are available

**Example:**
```javascript
const voices = await speechPlugin.waitForVoices()
console.log(`Found ${voices.length} voices`)
```

## Complete Usage Example

```javascript
import SpeechPlugin from './speech-plugin.js'

async function main() {
  // Create plugin with default config
  const speechPlugin = SpeechPlugin.fromDefaultConfigFile()
  
  try {
    // Start the server
    await speechPlugin.launchServer()
    console.log(`Server started at ${speechPlugin.baseUrl()}`)
    
    // Open browser
    await speechPlugin.openBrowser()
    console.log(`Browser opened at ${speechPlugin.spaUrl()}`)
    
    // Wait for voices to be available
    const voices = await speechPlugin.waitForVoices()
    console.log(`Available voices: ${voices.length}`)
    
    // Get current status
    const status = await speechPlugin.getRunningStatus()
    console.log(`Current status: ${status.runningStatus}`)
    
    // Speak something
    await speechPlugin.speak({ 
      sentence: "Hello from the SpeechPlugin API!",
      voice: voices[0].name
    })
    console.log("Speech completed")
    
  } finally {
    // Clean up
    await speechPlugin.stopServer()
    console.log("Server stopped")
  }
}

main().catch(console.error)
```

## Error Handling

All async methods throw errors for various conditions:

- **Network errors**: Server not reachable, connection timeouts
- **API errors**: HTTP 4xx/5xx responses from the server
- **Timeout errors**: Operations taking too long (waiting for status/voices)
- **Configuration errors**: Missing or invalid configuration

Always wrap method calls in try-catch blocks for robust error handling.

## Configuration Structure

The configuration object should follow this structure:

```javascript
{
  "port": 3000,
  "browser": "edge",
  "platform": "windows",
  "maxLogLines": 15,
  "apiKey": "your-api-key",
  "browsers": {
    "edge": {
      "runCommand": {
        "windows": "cmd /c start msedge {url}",
        "linux": "msedge {url}",
        "mac": "open -a Microsoft\\ Edge {url}"
      },
      "preferredVoices": ["Microsoft Zira Desktop"]
    },
    "chrome": {
      "runCommand": {
        "windows": "cmd /c start chrome {url}",
        "linux": "google-chrome {url}",
        "mac": "open -a Google\\ Chrome {url}"
      },
      "preferredVoices": ["Google US English"]
    }
  }
}
```

## Notes

- The plugin manages server state internally; multiple `launchServer()` calls are safe
- Browser processes are launched detached and won't block the Node.js process
- The `speak()` method automatically waits for speech completion
- All HTTP requests include proper error handling and timeout management
- The plugin is designed for both programmatic use and CLI tool implementation
