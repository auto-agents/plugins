# command: `hugfc`

Implements a new command named `hugfc`, according to the specification in file `modules/tasks/dev-com.md`. Write the result in the appropriate file in `modules/hugging-face/module/commands/` folder. 

update the property `cli.commands` in file `modules/hugging-face/module/config/config.js` to include the new command. Add the file and the property if they are missing. 

Implements a command implementation body in the run method of the command class. The body must find one parameter in `args` named `model`. It must call the python cli tool `modules/hugging-face/src/get_model_card/cli.py <modelName>` passing the model name as argument.

Use as a model the command class in `cli/source/commands/agent-command.js` and its command descriptor in the file `cli/source/config/config.js`, the entry with `names: ['agent', 'ag', 'a']`

The command `hugfc` is used to access to the web service hugging face.
- The action `model` of the command implements the output of the `markdown` text returned by the python tool `cli.py`


The command descriptor is given below:

```js
{
    names: ['hugfc','hu'],
    description: 'access to hugging face api',
    config: {
        options: {
            action: {
                type: 'string',
                required: true,
                allowedValues: [
                    { 
                        value: 'card',
                        description: 'get the model card of the model with the name given with --name from hugging face'
                    },
                    { 
                        value: 'fetch',
                        description: 'fetch models specifications from the hugging face REST API. if option name is specified output information about the named model if founded'
                    }
                ],                
                description: 'an action order for the hugfc command'
            },
            name: {
                type: "string",
                required: false,
                short: 'n',
                description: "the name of the model. required for action 'card'"
            }
        },
        allowPositionals: true
    },
    file: 'hugfc-command.js'l
}
```

## about the action value: 'fetch'

this command allows to fetch informations about models from the **hugging face REST API**.
- a JSON document is obtained from a `GET` request to the **URL** definied in the module specification `this.ctx.modules.huggingFace.config.urls.fetchModels`
- the implementation of the action `fetch` performs the **GET request** at this URL and get a JSON document listing models
- then the `fetch` construct a `Javascript` object that is stored in the property `this.ctx.modules.huggingFace.models`, the objects have a structure that match the **JSON** properties
- then the `fetch` command output the number of models founded
- if option name is specified output informations about the named model if founded
