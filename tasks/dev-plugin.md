# build an integrable plugin for auto-agents/cli

## Overview

This document describes how to implement a new plugin that can be integrated by the CLI tool in `auto-agents/cli` according to the plugin model specification. Plugins are dynamically loadable extensions by the CLI application.

Integrating a plugin consists in incorporate in the `auto-agents/cli` the following elements:
- **configuration**: from `{pluginName}/plugin/config/config.js`
- **commands**: from files named `{commandName}-command.js` in `{pluginName}/plugin/commands/`
- **plugin class**: from file `{pluginName}-plugin.js` in `{pluginName}/plugin/plugin/`

## Plugin Structure

A plugin is defined by three main components:

1. **Plugin Definition** - Configuration in `config/config.js` in property `plugins`
2. **Plugin Implementation** - JavaScript class in `plugins/` directory
3. **Plugin Registration** - Automatic discovery by the command controller in `auto-agents/cli/source/controllers/plugin-controller.js`

## Implementation Steps

## Step 1 : Create the plugin specification

- A plugin is specified by `js properties` in the file `plugins/{pluginName}/plugin/config/config.js` in the property `plugins` 
- the plugin specification object is defined as follows:

Use existing models of command specifications as examples from the file `auto-agents/cli/source/config/config.js` in property `cli.plugins`

In this document, `ctx` and `this.ctx` refers to the content of the js object specified in `config.js` that is returned by the function `config(cli)`, and `{pluginName}` must be substituted by the plugin name (camel case)

Add your plugin definition to the `cli.plugins` object in `plugins/{pluginName}/plugin/config/config.js` as follows:

```js
plugins: {
    pluginId: {        
        description: 'the description of the plugin',
        file: 'the file name that implements the plugin. by example: my-plugin.js',
        // indicates if the plugin is loaded internally at any time when the cli needs it (default is false)
        autoLoad: true,
        // indicates if the plugin must be loaded automatically or not at cli startup
        enabled: true,
        // indicates if the plugin has been loaded by the cli
        isLoaded: false,
        // indicates if the plugin can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs
        internal: false,

        // here any property required for the plugin configuration
    }
}
```

where properties are:
- **pluginId** : an unique plugin identifier. generally will be the same as the plugin name
- **description** : a text that describe the plugin purposes
- **autoLoad** : a boolean that indicates if the plugin must be loaded automatically or not at cli startup
- **enabled** : a boolean that indicates indicates if the plugin has been loaded by the cli
- **isLoaded** : a boolean that indicates if the plugin can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs
- **internal** : a boolean that indicates if the plugin can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs, and the user can not load it manually using the cli commands (eg. `/plugin load {pluginName}`)

### Step 2: Implement the Plugin Class

- a plugin class file is stored in the `plugins/{pluginName}/plugin/` folder

Create a default export class that follows this structure:

**Class Naming Convention:**
- Remove `.js` extension from filename
- Remove hyphens (`-`)
- Capitalize the first letter after each removed hyphen
- Example: `my-plugin-plugin.js` → `MyPluginPlugin`

use this code example as pattern:

```js
export default class MyPlugin {

    constructor(ctx, config, outputContext, pluginSpec)
        this.config = config
        this.specification = pluginSpec
        this.ctx = ctx
        this.outputContext = outputContext
    }

    /**
     * plugin init
     */
    async init() {
        // depends on each plugin
        // ...
    }

    /**
     * unload plugin
     * @param {Object} outputContext 
     */
    async unload(outputContext) {
        const oc = outputContext || this.outputContext
        const o = oc.output
        const margin = ' '.repeat(oc.margin + oc.marginBase)

        // include this comment as an implementation example for further devevelopment
		/*
		const stopAct = async () => {
			// TODO ...
		}

		o.newLine()
		const stopSrvAction = new ActionController(
			this.ctx,
			o,
			stopAct,
			new SpinnerService(this.ctx, o)
				.newSpinner(margin + '- stopping plugin <plugin_name>: ' + this.specification.pluginId, cliSpinners.sand)
		)
		await stopSrvAction.run()
		*/
    }
```

where:
- `MyClassName`:  the class name corresponding to the plugin name according to the naming conventions indicated above
- `ctx`:  the configuration object provided by the file `config.js`
- `pluginSpec`:  the plugin configuration object provided by the file `config.js`, in the property `plugins.{pluginId}`
- `outputContext`: the output context to be used by the plugin implementation for needs of output strings on display. this is an object of type `OutputContet` defined in the file `cli/source/data/output-context.js`

Keep the commentaries as provided in the code example

No additional registration or integration steps are required beyond the configuration and implementation described above.
