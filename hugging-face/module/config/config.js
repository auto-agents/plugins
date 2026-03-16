export default function config(cli) {
	return {
		modules: {
			huggingFace: {
				moduleId: 'huggingFace',
				description: 'hugging face hub access module',
				file: 'hugging-face-module.js',

				autoLoad: true,
				enabled: true,
				isLoaded: false,
				internal: false,

				config: {
					urls: {
						fetchModels: 'https://huggingface.co/api/models'
					},
					maxFetchResults: 15
				}
			}
		},
		cli: {
			commands: [
				{
					names: ['hugfc', 'hu'],
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
								type: 'string',
								required: false,
								short: 'n',
								description: "the name of the model. required for action 'card'"
							}
						},
						allowPositionals: true
					},
					file: 'hugfc-command.js'
				}
			]
		}
	}
}
