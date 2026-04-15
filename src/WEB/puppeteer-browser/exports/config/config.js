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
					// in case of detached, launch a detached browser with detachCmd
					detached: true,
					headless: false,
					devtools: true,
					viewport: {
						width: 1200,
						height: 1024
					},
					focusOnOpenPage: true,
					paths: {
						scrapers: '../../src/components/scrapers'	// related to plugin exports/plugin folder
					},
					scrappers: {
						google: {
							file: 'google-scraper.js',
							queryUrl: 'https://www.google.com',	// /search?q={search_query}
							scriptsPath: 'scripts',
							scripts: {
								runQuery: 'query-home-page.js',
								scrapResults: 'parse-result-page.js'
							},
							pathNames: {
								captcha: '/sorry/index'
							},
							minimumPauseDelay: 250,
							includeYouTubeResults: false,
							excludeEmptyTopics: true
						}
					},
					// when user lanuch a dev browser instance by his own
					// reuse from a previously auto-launched instance properties (see in puppeteer cache)
					detachedInstance: {
						cmd: [
							"--allow-pre-commit-input",
							"--disable-background-networking", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows",
							"--disable-breakpad", "--disable-client-side-phishing-detection",
							"--disable-component-extensions-with-background-pages", "--disable-crash-reporter", "--disable-default-apps",
							"--disable-dev-shm-usage", "--disable-hang-monitor", "--disable-infobars", "--disable-ipc-flooding-protection",
							"--disable-popup-blocking", "--disable-prompt-on-repost", "--disable-renderer-backgrounding",
							"--disable-search-engine-choice-screen", "--disable-sync", "--enable-automation", "--export-tagged-pdf",
							"--force-color-profile=srgb", "--generate-pdf-document-outline", "--metrics-recording-only", "--no-first-run",
							"--password-store=basic", "--use-mock-keychain",
							"--disable-features=Translate,AcceptCHFrame,MediaRouter,OptimizationHints,RenderDocument,PartitionAllocSchedulerLoopQuarantineTaskControlledPurge,ProcessPerSiteUpToMainFrameThreshold,IsolateSandboxedIframes",
							"--enable-features=PdfOopif", "--auto-open-devtools-for-tabs", "--disable-extensions", "about:blank",
							"--remote-debugging-port=0", "--user-data-dir=C:\\Users\\franc\\AppData\\Local\Temp\\puppeteer_dev_chrome_profile-zJsjjH"
						],
						line: '"C:<\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --allow-pre-commit-input --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-crash-reporter --disable-default-apps --disable-dev-shm-usage --disable-hang-monitor --disable-infobars --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-search-engine-choice-screen --disable-sync --enable-automation --export-tagged-pdf --force-color-profile=srgb --generate-pdf-document-outline --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --disable-features=Translate,AcceptCHFrame,MediaRouter,OptimizationHints,RenderDocument,PartitionAllocSchedulerLoopQuarantineTaskControlledPurge,ProcessPerSiteUpToMainFrameThreshold,IsolateSandboxedIframes --enable-features=PdfOopif --auto-open-devtools-for-tabs --disable-extensions about:blank --remote-debugging-port=0 --user-data-dir=C:\\Users\\franc\\AppData\\Local\\Temp\\puppeteer_dev_chrome_profile-zJsjjH',
						wse: 'ws://127.0.0.1:45749/devtools/browser/ab1e4edf-b933-4f91-8a9c-e84213be5f06'
					}
				}
			}
		},
		cli: {
			commands: [
				{
					names: ['puppeteer', 'pup'],
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
									},
									{
										value: 'search',
										description: 'run a query on a site using the specified scrapper with id'
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
							},
							text: {
								type: 'string',
								required: false,
								short: 't',
								description: "eventually text parameter"
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
