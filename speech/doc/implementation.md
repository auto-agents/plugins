## Speech plugin implementation

## What the speech plugin should be

From `plugins/speech/specifications/speech-plugin-model.md`, the plugin is:

- A standalone Node.js service exposing an HTTP REST API (Express).
- It launches a browser that runs a single-page web app using the Web Speech API.
- The browser-side app performs the actual speech work, while the Node service acts as:
  - API gateway
  - state owner (`idle` / `speaking`)
  - process orchestrator (start browser, reconnect, etc.)

## High-level architecture

### 1) Node service (Express)

Responsibilities:

- Load config from `plugins/speech/src/config/config.json`:
  - `apiKey`
  - `platform` (`linux` | `windows` | `mac`, default `windows`)
  - `browser` (browser key to be launched, default `edge`)
  - `port`
  - `browsers.{chrome|edge}.runCommand`
  - `browsers.*.preferredVoices`
- Expose REST endpoints:
  - `POST /speak`
  - `POST /stop`
  - `GET /status`
  - `GET /capabilities`
- Maintain authoritative state:
  - `runningStatus = "idle" | "speaking"`
  - cached capabilities (`voiceList`)
- Launch and supervise a browser:
  - `child_process.spawn()` using configured `runCommand`
  - open the SPA URL (e.g. `http://localhost:<port>/app`)
- Bridge REST to the browser SPA:
  - WebSocket (recommended) between Node and the SPA
  - REST calls enqueue/emit “commands” that the SPA executes

WebSocket is a good fit because you need bidirectional messaging for:

- sending `speak` / `stop` commands to the browser
- receiving `onstart` / `onend` / `onerror` events back to Node to update `/status`

### 2) Browser SPA (Web Speech API)

Responsibilities:

- Implement speech using Web Speech API:
  - `speechSynthesis.getVoices()`
  - `SpeechSynthesisUtterance(sentence)`
  - `speechSynthesis.speak(utterance)`
  - `speechSynthesis.cancel()` for stop
- Provide a minimal UI:
  - running status display (`idle` / `speaking`)
  - current activity (sentence being spoken, selected voice)
  - connection status to Node
- Keep local state for UI, but treat Node as the source of truth.

### 3) Messaging contract (Node ↔ SPA)

Define JSON messages over WebSocket:

- Commands Node → SPA
  - `{"type":"SPEAK","sentence":"...","voice":"..."}`
  - `{"type":"STOP"}`
  - `{"type":"GET_CAPABILITIES"}` (optional; SPA can also push on connect)

- Events SPA → Node
  - `{"type":"STATUS","runningStatus":"idle"|"speaking"}`
  - `{"type":"CAPABILITIES","voiceList":[{"name":"...","lang":"..."}]}`
  - `{"type":"ERROR","message":"..."}`
  - `{"type":"ACTIVITY","sentence":"...","voice":"..."}` (optional)

Node updates internal state when events arrive; REST endpoints read from that state.

## REST API behavior

### `POST /speak`

- Auth: payload `apiKey` must match config; else `401`.
- Interrupt behavior:
  - if currently speaking, receiving a new `speak` should interrupt and replace the current one (matches the spec’s “or if it receive a new `speak` command”).
- Execution:
  - Node sends `SPEAK` to SPA.
  - Node may optimistically set status to `speaking`, then confirm via SPA `STATUS` event.

Payload (per spec):

```json
{ "sentence": "...", "voice": "Voice Name (optional)", "apiKey": "..." }
```

Voice selection logic:

- If `voice` is provided: SPA tries exact match by `name`. (not dependent on the selected platform)
- Else: SPA selects the first match from configured `preferredVoices` for the chosen browser.
- Else: fall back to browser default voice.

### `POST /stop`

- Node sends `STOP` to SPA.
- Node sets status to `idle` after SPA confirms (or after a short timeout as a fallback).

### `GET /status`

Returns Node’s current status:

```json
{ "runningStatus": "idle" }
```

### `GET /capabilities`

Returns cached voices last reported by the SPA:

```json
{ "voiceList": [ { "name": "...", "lang": "..." } ] }
```

Because voice enumeration is browser-side, Node learns this list from the SPA.

## Process startup sequence

1. Node loads config, starts Express on `config.port`.
2. Node serves:
   - REST under `/`
   - SPA static assets under `/app` (or `/`)
3. Node starts WebSocket server (same port).[config.platform]`, default platform is `windows
4. Node launches browser using `browsers[config.browser].runCommand` (default browser is `edge`) pointing to the SPA URL.
5. SPA connects to WebSocket and pushes:
   - `CAPABILITIES` (voice list)
   - `STATUS: idle`
6. Node is now ready to accept REST calls.

## Failure modes to handle

- Browser not available / Web Speech API missing:
  - SPA sends `ERROR`.
  - Node logs error; `/status` remains `idle`.
- No WebSocket connection:
  - `POST /speak` should return `503` (cannot execute).
- Voice not found:
  - SPA falls back to default voice and optionally emits an `ERROR`/warning event.

## Fit with the CLI config

In `cli/src/config/config.js` you already have:

```js
plugins: {
  speech: {
    enabled: true,
    browserStartCommand: 'edge',
    startCommand: 'speak'
  }
}
```

So a natural integration is:

- CLI starts the speech plugin service if it is not already running.
- CLI sends HTTP requests (e.g. `POST /speak`) when a command like `/speak hello` is invoked.

## Files

- the plugin is implemented in `plugins/speech/src`
- the SPA files are in `plugins/speech/src/spa`
- the backend filed are in `plugins/speech/src/backend`
- the main file is in `plugins/speech/src/main.js`
- the configuration file is in `plugins/speech/src/config/config.json`
- the specification file is in `plugins/speech/specifications/speech-plugin-model.md`
- your implementation guidelines are in `plugins/speech/doc/implementation.md`
- the tasks are in `plugins/speech/tasks`
