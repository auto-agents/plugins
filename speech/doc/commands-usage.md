# Speech Plugin CLI Commands Usage

This document describes the command-line interface (CLI) commands available for the speech plugin.

## Overview

The speech plugin provides several CLI commands that allow you to control the speech server, open the browser interface, speak text, and query system status. All commands are accessible via npm scripts in the `plugins/speech/package.json` file.

## Common Parameters

All commands support the following common parameters:

- `--config <path>`: Path to the configuration file (default: `src/config/config.json`)
- If no server is running, most commands will automatically start one unless `--no-launch` flag is used

## Available Commands

### 1. Launch Server

**Command:** `npm run cmd:launch-server`

**Description:** Starts the speech plugin server and keeps it running until interrupted.

**Usage:**
```bash
npm run cmd:launch-server
npm run cmd:launch-server -- --config /path/to/custom-config.json
```

**Parameters:**
- `--config <path>`: Optional path to custom configuration file

**Behavior:**
- Starts the HTTP server on the configured port
- Starts the WebSocket server for SPA communication
- Server runs until SIGINT (Ctrl+C) or SIGTERM is received
- Outputs the server URL when ready

### 2. Open Browser

**Command:** `npm run cmd:open-browser`

**Description:** Opens the SPA (Single Page Application) in the configured browser.

**Usage:**
```bash
npm run cmd:open-browser
npm run cmd:open-browser -- --no-launch
npm run cmd:open-browser -- --config /path/to/custom-config.json
```

**Parameters:**
- `--no-launch`: Don't start the server (assumes server is already running)
- `--config <path>`: Optional path to custom configuration file

**Behavior:**
- By default, starts the server if not running
- Opens the SPA URL in the configured browser (default: Edge)
- Outputs the SPA URL when opened
- If server was started by this command, it runs until interrupted

### 3. Speak Text

**Command:** `npm run cmd:speak`

**Description:** Speaks a sentence using the speech synthesis API.

**Usage:**
```bash
npm run cmd:speak -- --sentence "Hello world"
npm run cmd:speak -- --sentence "Hello world" --voice "Microsoft Zira Desktop"
npm run cmd:speak -- --sentence "Hello world" --no-launch --no-browser
npm run cmd:speak -- --sentence "Hello world" --apiKey "your-api-key"
```

**Required Parameters:**
- `--sentence <text>`: The text to speak

**Optional Parameters:**
- `--voice <name>`: Voice name to use (if not specified, uses first available voice)
- `--apiKey <key>`: API key override (if not specified, uses config value)
- `--no-launch`: Don't start the server (assumes server is already running)
- `--no-browser`: Don't open browser (useful when SPA is already open)

**Behavior:**
- By default, starts server and opens browser if needed
- Waits for voices to be available
- Speaks the specified sentence
- Waits for speech to complete before exiting
- Outputs "spoken" when successful

### 4. Get Running Status

**Command:** `npm run cmd:get-running-status`

**Description:** Queries and displays the current running status of the speech plugin.

**Usage:**
```bash
npm run cmd:get-running-status
npm run cmd:get-running-status -- --launch
npm run cmd:get-running-status -- --config /path/to/custom-config.json
```

**Parameters:**
- `--launch`: Start the server temporarily to get status
- `--config <path>`: Optional path to custom configuration file

**Behavior:**
- Connects to existing server or starts one temporarily if `--launch` is used
- Queries the `/status` endpoint
- Outputs JSON with current status including:
  - `runningStatus`: "idle" or "speaking"
  - `voiceCount`: Number of available voices
  - Other status information

### 5. Get Voices

**Command:** `npm run cmd:get-voices`

**Description:** Retrieves and displays the list of available voices.

**Usage:**
```bash
npm run cmd:get-voices
npm run cmd:get-voices -- --launch
npm run cmd:get-voices -- --wait
npm run cmd:get-voices -- --launch --wait
```

**Parameters:**
- `--launch`: Start the server temporarily to get voices
- `--wait`: Wait for voices to be loaded (returns empty list if no voices available)
- `--config <path>`: Optional path to custom configuration file

**Behavior:**
- Connects to existing server or starts one temporarily if `--launch` is used
- Queries the `/capabilities` endpoint
- If `--wait` is used, waits until voices are available
- Outputs JSON with `voiceList` array containing voice objects with properties like:
  - `name`: Voice display name
  - `lang`: Language code
  - Other voice-specific properties

## Examples

### Basic Usage Workflow

1. **Start the server:**
   ```bash
   npm run cmd:launch-server
   ```

2. **In another terminal, open the browser:**
   ```bash
   npm run cmd:open-browser -- --no-launch
   ```

3. **Speak some text:**
   ```bash
   npm run cmd:speak -- --sentence "Hello from the speech plugin" --no-launch --no-browser
   ```

4. **Check status:**
   ```bash
   npm run cmd:get-running-status -- --launch
   ```

5. **List available voices:**
   ```bash
   npm run cmd:get-voices -- --launch --wait
   ```

### Quick Test with Auto-Management

```bash
# Speak text with automatic server and browser management
npm run cmd:speak -- --sentence "This is a test"

# Get voices with temporary server
npm run cmd:get-voices -- --launch --wait
```

## Configuration

The commands use the configuration file at `src/config/config.json` by default. This file includes:

- `port`: Server port (default: 3000)
- `browser`: Browser to use (default: "edge")
- `platform`: Platform for browser commands (default: "windows")
- `maxLogLines`: Maximum log lines in SPA (default: 15)
- `browsers`: Platform-specific browser launch commands
- `apiKey`: API key for speech services

You can override the configuration file path using the `--config` parameter with any command.

## Error Handling

All commands will:
- Output error messages to stderr
- Set exit code 1 on error
- Provide descriptive error messages for missing required parameters
- Handle network timeouts and connection errors gracefully

## Notes

- The `stop-server` command is intentionally not implemented as per requirements
- Commands that modify server state (speak) will wait for completion before exiting
- The `--no-launch` and `--no-browser` flags are useful for scripting and automation
- All JSON output is formatted with 2-space indentation for readability
