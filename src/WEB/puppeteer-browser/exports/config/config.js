export default function config(ctx) {

	return {
		plugins: {
			puppeteerBrowser: {
				pluginId: 'puppeteerBrowser',
				description: 'plugin for Pupeteer',
				file: 'puppeteer-browser-plugin.js',
				category: 'WEB',

				autoLoad: true,
				enabled: true,
				isLoaded: false,
				internal: false,

				config: {
					headless: false,
					devtools: true,
					viewport: {
						width: 1200,
						height: 1024
					},
					scrappers: {
						google: {
							queryUrl: 'https://www.google.com/search?q={search_query}'
						}
					}
				}
			}
		},
		cli: {
			commands: [
				{
					names: ['puppeteer', 'pup', 'p'],
					description: 'puppeteer plugin control command',
					config: {
						options: {
							action: {
								type: 'string',
								required: true,
								allowedValues: [
									{
										value: 'open',
										description: 'open the browser at the given url'
									},
									{
										value: 'close',
										description: 'close the page specified with --id'
									}
								],
								description: 'an action to control the puppetter plugin browser'
							},
							url: {
								type: 'string',
								required: false,
								short: 'u',
								description: "eventually url parameter"
							},
							id: {
								type: 'string',
								required: false,
								short: 'i',
								description: "eventually a page id"
							}
						},
						allowPositionals: true
					},
					file: 'puppeteer-command.js'
				}
			]
		}
	}
}
