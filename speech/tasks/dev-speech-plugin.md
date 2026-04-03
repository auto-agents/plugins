# Develop speech plugin

## base implementation

### 1) check specification

```text
describe an implementation of the speech plugin
```

### 2) implement the plugin

```text
implements the speech plugin in folder `plugins/speech/` according to the specifications and guidelines in the files `plugins/speech/specifications/speech-plugin-model.md` and `plugins/speech/doc/implementation.md`
```

### 3) iterations: specification and implementation fixes

```text
i have fixed the specification file `plugins/speech/specifications/speech-plugin-model.md` according to your guidelines in `plugins/speech/doc/implementation.md`. fix the guidelines in `plugins/speech/doc/implementation.md` to match the specification file.

Add in config.json a 'browser' parameter (default edge) and update code to choose runCommand/preferredVoices based on it. fix the specification and the guidelines accordingly

Add a test program in `plugins/speech/src/test.js` that launch the plugin and call the web api to speak the sentence 'hello world'

test test.js must first get the available voices list and select the first one to pass as a parameter to the speak web api call
```

### 4) improvements

#### spa log

```text
limit the size of the log displayed in the SPA page to a number of lines defined by the new property `maxLogLines` in config.json, default value to 15
```

#### display voices list in spa

```text
add the display of the list of available voices with all of their properties in the SPA page
```

#### plateform selection

```text
add a property in the config.json that indicates the plateform where the software is running on. it might be `linux`, `windows` or `mac` default value to `windows`. the settings `browsers` must be updated to use the correct run command. the preferred voices settings must not dependent on the selected plateform
```

#### js plugin

```text
Add a js plugin in the file `plugins/speech/src/speech-plugin.js` that can be imported in any node project that export the following methods:
- launch the plugin server (returns a promise that resolves when the plugin is ready to be used)
- stop the plugin server (returns a promise that resolves when the plugin is stopped)
- open the browser on the SPA page (returns a promise that resolves when the browser is opened)
- speak a sentence (returns a promise that resolves when the sentence has been spoken or rejects if an error occurs)
- get the current running status (returns a promise that resolves to the current running status)
- get the list of available voices (returns a promise that resolves to the list of available voices)
All the methods have parameters that corresponds to the parameters of the web api calls
Adapt the file `test.js` and the file `main.js` to use the new file `speech-plugin.js`

fix: the SPA logs 'ws interrupted' and do not speek

fix: the test.js never terminates

fix: illegal newline after throw
```

#### add test commands

```text
add js files in plugin/speech/src/commands to call each method exposed by speech-plugin.js. these commands must be implemented as cli tools with parameters. add them as npm commands in package.json. commands file names have no upper case letters. use - to separate words. do not implement the `stop` command
```

### document it

```text
document the commands usage in the new file `plugins/speech/doc/commands-usage.md`

document the usage of the methods of speech-plugin.js in the new file `plugins/speech/doc/speech-plugin-usage.md`
```

*👉 this task should requires using model **GPT-2.5 low reasoning***

step 1) is  saved into doc/implementation.md

### had to fix errors at first implementation

```shell
TypeError [ERR_IMPORT_ATTRIBUTE_MISSING]: Plugin "file:///E:/DEV/repos/auto-agents/plugins/speech/src/config/config.json" needs an import attribute of "type: json"
    at validateAttributes (node:internal/plugins/esm/assert:88:15)
    at defaultLoadSync (node:internal/plugins/esm/load:164:3)
    at #loadAndMaybeBlockOnLoaderThread (node:internal/plugins/esm/loader:795:12)
    at #loadSync (node:internal/plugins/esm/loader:815:49)
    at PluginLoader.load (node:internal/plugins/esm/loader:780:26)
    at PluginLoader.loadAndTranslate (node:internal/plugins/esm/loader:526:31)
    at #getOrCreatePluginJobAfterResolve (node:internal/plugins/esm/loader:571:36)
    at afterResolve (node:internal/plugins/esm/loader:624:52)
    at PluginLoader.getOrCreatePluginJob (node:internal/plugins/esm/loader:630:12)
    at onImport.tracePromise.__proto__ (node:internal/plugins/esm/loader:649:32) {
  code: 'ERR_IMPORT_ATTRIBUTE_MISSING'
}
```

```shell
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' imported from E:\DEV\repos\auto-agents\plugins\speech\src\backend\server.js
    at Object.getPackageJSONURL (node:internal/plugins/package_json_reader:316:9)
    at packageResolve (node:internal/plugins/esm/resolve:768:81)
    at pluginResolve (node:internal/plugins/esm/resolve:858:18)
    at defaultResolve (node:internal/plugins/esm/resolve:990:11)
    at #cachedDefaultResolve (node:internal/plugins/esm/loader:718:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/plugins/esm/loader:735:38)
    at PluginLoader.resolveSync (node:internal/plugins/esm/loader:764:52)
    at #resolve (node:internal/plugins/esm/loader:700:17)
    at PluginLoader.getOrCreatePluginJob (node:internal/plugins/esm/loader:620:35)
    at PluginJob.syncLink (node:internal/plugins/esm/plugin_job:143:33) {
  code: 'ERR_MODULE_NOT_FOUND'
}
```

```shell
Error: timeout waiting for voice capabilities (is the browser SPA connected?)
    at waitForVoices (file:///E:/DEV/repos/auto-agents/plugins/speech/src/test.js:62:8)
    at async main (file:///E:/DEV/repos/auto-agents/plugins/speech/src/test.js:90:21)
```
