# Speech plugin model

## definitions

The speech plugin is a stand-alone service accessible throught a `HTTP` interface. It provides text-to-speech capabilities. It can be used by any agent and by the cli tool to convert speech to text.

## implementation

The speech functionalities is provided by any browser that implements the Web Speech API.

The plugin first runs an http server running a web api that listen to http requests, according to the interface REST specifications. The plugin is based on the NodeJS runtime environment and javascsript. The http server is implemented by the `express` framework. Once the server is ready, the plugin opens a browser window that runs a web application that provides text-to-speech capabilities. The web application is implemented by the `web speech api`. The web application contains a single page (SPA) that provides a simple interface to the user to shows the text-to-speech api, running status and current activity. The running status is one of the follwing:
```json
{
    "runningStatus": "idle" | "speaking"
}
```
Where:
- **idle** : the plugin is not speaking and is waiting for a new command through the web api
- **speaking** : the plugin is speaking until it has finished the given sentence to be speaked or if it has an error or if it received a `stop` command through the web api or if it receive a new `speak' command through the web api

The web api REST interface is defined as below:
- possible commands are:
    - POST /speak : speak the given sentence with payload:
    ```json
    {
        "sentence": "the sentence to be speaked",
        "voice": "name of the voice to be used by the web speecj api",
        "apiKey": "the api key that must match the one defined in the plugin configuration"
    }
    ```
    - POST /stop : stop the current speek if any and go back to idle state, else stay in the idle state
    - GET /status : get the current running status. returns a JSON object like structured like below:
    ```json
    {
        "runningStatus": "idle" | "speaking"
    }
    ```
    - GET /capabilities : returns informations about the availables voices that are provided by the web speech api implemented by the running browser. returns a JSON object structured like below:
    ```json
    {
        "voiceList": [ /* array of voiceDescription objects */]
    }
    ```
    the `voiceDescription` object is defined as below:
    ```json
    {
        "name": "the name of the voice",
        "lang": "the language of the voice using ISO 639-2 language code or ISO 639-1 language code or the string 'multilingual' if the voice support multiple languages"
    }
    ```

    ## configuration

    Any plugin configuration is stored in a json file. The plugin configuration file is defined in the file `src/config/config.json`. It has at least the properties as described below:
    ```json
    {
        "apiKey": "the api key that must match the one defined in the plugin configuration",        
        "platform": "the plateform where the software is running on. might be 'linux', 'windows' or 'mac'. default is 'windows'",
        "browser": "the browser key to be launched. must match a key in the browsers object. default is 'edge'",
        "port": "the port on which the http server runs",
        "browsers": {
            /* json objects for each configured browser */
            "chrome": {
                "runCommand": {
                    "windows": "the sell command that runs the browser and opens the web application on windows",
                    "linux": "the sell command that runs the browser and opens the web application on linux",
                    "mac": "the sell command that runs the browser and opens the web application on mac"
                },
                "preferredVoices": [ /* array of names of preferred voices the user want to be used when no voice is specified */ ]        
            },
            "edge": {
                "runCommand": {
                    "windows": "the sell command that runs the browser and opens the web application on windows",
                    "linux": "the sell command that runs the browser and opens the web application on linux",
                    "mac": "the sell command that runs the browser and opens the web application on mac"
                },
                "preferredVoices": [ /* array of names of preferred voices the user want to be used when no voice is specified */ ]
            }
        
    }
    ```

    ## files

    - the plugin is implemented in `plugins/speech/src`
    - the SPA files are in `plugins/speech/src/spa`
    - the backend filed are in `plugins/speech/src/backend`
    - the main file is in `plugins/speech/src/main.js`
    - the configuration file is in `plugins/speech/src/config/config.json`
    - the specification file is in `plugins/speech/specifications/speech-plugin-model.md`
    - your implementation guidelines are in `plugins/speech/doc/implementation.md`
    - the tasks are in `plugins/speech/tasks`

