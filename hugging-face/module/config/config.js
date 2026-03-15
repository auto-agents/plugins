export default function config(cli) {
	return {
		cli: {
			commands: [
				{
					names: ['hugfc', 'hu'],
					description: 'access to settings, configuration, run-time variables',
					config: {
						options: {
							action: {
								type: 'string',
								required: true,
								allowedValues: [
									{
										value: 'card',
										description: 'get the model card of the model with the name given with --name from hugging face'
									}
								],
								description: 'an action order for the hugfc command'
							},
							name: {
								type: 'string',
								required: true,
								short: 'm',
								description: 'the name of the model'
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
