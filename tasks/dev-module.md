# build an integrable module for auto-agents/cli

## Overview

This document describes how to implement a new module that can be integrated by the CLI tool in `auto-agents/cli` according to the module model specification. Modules are dynamically loadable extensions by the CLI application.

Integrating a module consists in incorporate in the `auto-agents/cli` the following elements:
- **configuration**: from `{moduleName}/module/config/config.js`
- **commands**: from files named `{commandName}-command.js` in `{moduleName}/module/commands/`
- **module class**: from file `{moduleName}-module.js` in `{moduleName}/module/module/`

## Module Structure

A module is defined by three main components:

1. **Module Definition** - Configuration in `config/config.js` in property `modules`
2. **Module Implementation** - JavaScript class in `modules/` directory
3. **Module Registration** - Automatic discovery by the command controller in `auto-agents/cli/source/controllers/module-controller.js`

## Implementation Steps

## Step 1 : Create the module specification

- A module is specified by `js properties` in the file `modules/{moduleName}/module/config/config.js` in the property `modules` 
- the module specification object is defined as follows:

Use existing models of command specifications as examples from the file `auto-agents/cli/source/config/config.js` in property `cli.modules`

In this document, `ctx` and `this.ctx` refers to the content of the js object specified in `config.js` that is returned by the function `config(cli)`, and `{moduleName}` must be substituted by the module name (camel case)

Add your module definition to the `cli.modules` object in `modules/{moduleName}/module/config/config.js` as follows:

```js
modules: {
    moduleId: {        
        description: 'the description of the module',
        file: 'the file name that implements the module. by example: my-module.js',
        // indicates if the module is loaded internally at any time when the cli needs it (default is false)
        autoLoad: true,
        // indicates if the module must be loaded automatically or not at cli startup
        enabled: true,
        // indicates if the module has been loaded by the cli
        isLoaded: false,
        // indicates if the module can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs
        internal: false,

        // here any property required for the module configuration
    }
}
```

where properties are:
- **moduleId** : an unique module identifier. generally will be the same as the module name
- **description** : a text that describe the module purposes
- **autoLoad** : a boolean that indicates if the module must be loaded automatically or not at cli startup
- **enabled** : a boolean that indicates indicates if the module has been loaded by the cli
- **isLoaded** : a boolean that indicates if the module can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs
- **internal** : a boolean that indicates if the module can be loaded by user or not. if it is internal only the cli can load it depdendings on his needs, and the user can not load it manually using the cli commands (eg. `/module load {moduleName}`)

### Step 2: Implement the Module Class

- a module class file is stored in the `modules/{moduleName}/module/` folder

Create a default export class that follows this structure:

**Class Naming Convention:**
- Remove `.js` extension from filename
- Remove hyphens (`-`)
- Capitalize the first letter after each removed hyphen
- Example: `my-module-module.js` → `MyModuleModule`

use this code example as pattern:

```js
export default class MyModule {

    constructor(ctx, outputContext, moduleSpec)
        this.specification = moduleSpec
        this.ctx = ctx
        this.outputContext = outputContext
    }

    /**
     * module init
     */
    async init() {
        // depends on each module
        // ...
    }

    /**
     * unload module
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
				.newSpinner(margin + '- stopping module <module_name>: ' + this.specification.moduleId, cliSpinners.sand)
		)
		await stopSrvAction.run()
		*/
    }
```

where:
- `MyClassName`:  the class name corresponding to the module name according to the naming conventions indicated above
- `ctx`:  the configuration object provided by the file `config.js`
- `moduleSpec`:  the module configuration object provided by the file `config.js`, in the property `modules.{moduleId}`
- `outputContext`: the output context to be used by the module implementation for needs of output strings on display. this is an object of type `OutputContet` defined in the file `cli/source/data/output-context.js`

Keep the commentaries as provided in the code example

No additional registration or integration steps are required beyond the configuration and implementation described above.
