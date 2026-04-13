export default function config(ctx) {

	return {
		plugins: {
			puppeteerBrowser: {
				pluginId: 'puppeteerBrowser',
				description: 'plugin for Pupeteer',
				file: 'puppeteer-browser.js',
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
		}
	}
}
