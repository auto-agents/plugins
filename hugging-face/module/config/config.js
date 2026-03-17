import chalk from 'chalk'

export default function config() {
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
					pageSize: 10,
					minTagSize: 4,
					kbdHelp: `| ${chalk.inverse('C')}: close | ${chalk.inverse('Left')}: previous page | ${chalk.inverse('Right')}: next page`,
					legend: 'TL: Tool | TH: Think | VI: Vision | AU: Audio | CD: Code',
					keys: {
						close: 'c'
					},
					theme: {
						checkmark: chalk.hex('#00FF00')('x')
					},
					layout: {
						idMaxLen: 50,
						tagsMaxLen: 30
					}
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
