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
						fetchModels: 'https://huggingface.co/api/models',
						cardBaseUrl: 'https://huggingface.co/'
					},
					pageSize: 10,
					minTagSize: 4,
					kbdHelp: `| ${chalk.inverse('C')}: close | ${chalk.inverse('Left')}: previous page | ${chalk.inverse('Right')}: next page`,
					legend: chalk.italic('TL: Tool | TH: Think | VI: Vision | AU: Audio | CD: Code'),
					keys: {
						close: 'c'
					},
					theme: {
						checkmark: chalk.hex('#00FF00')('x '),
						selectedItem: {
							foreground: '#FFCC00'
						},
						hgCol: '#00DDDD',
						cmtCol: '#00DDAA'
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
								description: "the name of the model. required for action 'card' or --filter"
							},
							sort: {
								type: 'string',
								required: false,
								default: 'id',
								allowedValues: [
									{
										value: 'id',
										description: 'model id'
									},
									{
										value: 'B',
										description: 'milliards of parameters'
									},
									{
										value: 'dn',
										description: 'downloads'
									},
									{
										value: 'lk',
										description: 'likes'
									},
									{
										value: 'TL',
										description: 'model enable tools'
									},
									{
										value: 'TH',
										description: 'model enable think'
									},
									{
										value: 'VI',
										description: 'model enable vision or image/video'
									},
									{
										value: 'AU',
										description: 'model enable audio,speech,recognition,...'
									},
									{
										value: 'CD',
										description: 'model enable coding'
									}
								],
								short: 's',
								description: "the name of the field on which the table must be sorted. use with 'fetch'"
							},
							dir: {
								type: 'string',
								allowedValues: [
									{
										value: 'asc',
										description: 'ascendant sort'
									},
									{
										value: 'desc',
										description: 'descendant sort'
									}
								],
								default: 'asc',
								required: false,
								short: 'd',
								description: "the direction of the sort. use with 'fetch'"
							},
							filter: {
								type: 'string',
								required: false,
								default: '',
								allowedValues: [
									{
										value: '',
										description: 'no filter'
									},
									{
										value: 'id',
										description: 'model id'
									},
									{
										value: 'B',
										description: 'milliards of parameters in the model'
									},
									{
										value: 'TL',
										description: 'model enable tools'
									},
									{
										value: 'TH',
										description: 'model enable think'
									},
									{
										value: 'VI',
										description: 'model enable vision or image/video'
									},
									{
										value: 'AU',
										description: 'model enable audio,speech,recognition,...'
									},
									{
										value: 'CD',
										description: 'model enable coding'
									},
									{
										value: 'tags',
										description: 'model tags'
									}
								],
								short: 'f',
								description: "the name of the field on which a filter must be applied. use with 'fetch'"
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
