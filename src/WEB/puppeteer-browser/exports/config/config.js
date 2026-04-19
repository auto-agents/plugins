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
						plugins: '../../src/plugins',		// related to plugin exports/plugin folder
						searchPlugins: 'search',			// related to plugins
						getPlugins: 'get',					// related to plugins
						scripts: '../../src/scripts'		// related to plugin exports/plugin folder
					},
					dumpSearchResults: true,

					plugins: {
						search: {
							searchOptions: {
								action: null,				// requested action: SEARCH | GET
								browseSearchPages: [1],		// pages results to include in deep search
								limitResults: 3,			// result per page to handle for deep search
								pluginGetName: 'page-scraper',
								reuseGetPlugin: true		// if true reuse already instanciated get plugins
							},
							google: {
								file: 'google-scraper.js',
								queryUrl: 'https://www.google.com',	// /search?q={search_query}
								scriptsPath: 'scripts',
								imports: [
									'utils.js'
								],
								scripts: {
									runQuery: 'query-home-page.js',
									scrapResults: 'parse-result-page.js'
								},
								pathNames: {
									captcha: '/sorry/index'
								},
								minimumKbdDelay: 100,
								minimumPauseDelay: 250,
								includeYouTubeResults: true,
								excludeEmptyTopics: true,
								excludedResultUrls: [
									'https://maps.google.com/maps?',
									'https://www.google.com/travel/',
								],
								skipResults: 1
							}
						},
						get: {
							getOptions: {
								skipReload: true,
								reusePage: true,
								// max tabs (resps. scraps) to perform simultaneously
								maxTabs: 3,
								differDelay: 500
							},
							['page-scraper']: {
								file: 'page-scraper.js',
								scriptsPath: 'scripts',
								scripts: {
									scrapContent: 'scrap-content.js'
								},
								imports: [
								import { puppeteer } from 'puppeteer-core';
								'utils.js'
								]
							}
						}
					},
					theme: {
						resultItemNumber: '#63edffff',
						resultItemTopic: '#569fff',
						resultItemSummary: '#CCCCCC',
					},
					// when user launch a dev browser instance by his own
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
							"--remote-debugging-port=0", "--user-data-dir=C:\\Users\\franc\\AppData\\Local\Temp\\puppeteer_dev_chrome_profile-yAI6Yw"
						],
						line: '"C:<\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --allow-pre-commit-input --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-crash-reporter --disable-default-apps --disable-dev-shm-usage --disable-hang-monitor --disable-infobars --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-search-engine-choice-screen --disable-sync --enable-automation --export-tagged-pdf --force-color-profile=srgb --generate-pdf-document-outline --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --disable-features=Translate,AcceptCHFrame,MediaRouter,OptimizationHints,RenderDocument,PartitionAllocSchedulerLoopQuarantineTaskControlledPurge,ProcessPerSiteUpToMainFrameThreshold,IsolateSandboxedIframes --enable-features=PdfOopif --auto-open-devtools-for-tabs --disable-extensions about:blank --remote-debugging-port=0 --user-data-dir=C:\\Users\\franc\\AppData\\Local\\Temp\\puppeteer_dev_chrome_profile-yAI6Yw',
						wse: 'ws://127.0.0.1:2930/devtools/browser/66a06581-c5cf-4c1d-9187-db67a9e7e48d'
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
							},
							plugin: {
								type: 'string',
								required: false,
								short: 'p',
								description: 'eventually id of an existing plugin to reuse'
							},
							get: {
								type: 'string',
								required: false,
								short: 'g',
								description: 'follow any previous search results and produces a deep search result (opens and anylse the results pages). possibles values: list of pages numbers: 0,...,10 OR "all" OR "default"'
							},
							deep: {
								type: 'boolean',
								required: false,
								short: 'd',
								description: 'if combinated with search action, it enable the deep search after search engine use'
							},
							limit: {
								type: 'string',
								required: false,
								short: 'l',
								description: 'if combinated with deep search or get, indicates the max number of links of page results to follow. if zero limit is omitted'
							}
						},
						allowPositionals: true
					},
					file: 'puppeteer-command.js'
				}
			]
		},
		tools: [
			{
				file: 'web-search.js'
			}]
	}
}
