import puppeteer from 'puppeteer'

export default class PuppeteerBrowser {

	browser = null

	constructor(ctx, config, outputContext, pluginSpec, overloadConfig = null) {
		this.config = config
		this.specification = pluginSpec
		this.ctx = ctx
		this.outputContext = outputContext
		this.overloadConfig = overloadConfig
	}

	/**
	 * plugin init
	 */
	async init() {
		await this.open()
	}

	async open() {
		const browserPath = this.ctx.shell.browserChrome.path[
			this.ctx.shell.platform
		]
		this.browser = await puppeteer.launch({
			executablePath: browserPath,
			browser: 'chrome',
			headless: this.config.headless,
			devtools: this.config.devtools,
			//waitForInitialPage: true
		})
	}

	async openPage(url) {
		const page = await browser.newPage()
		await page.setViewport({
			width: this.config.viewport.width,
			height: this.config.viewport.height
		})
		if (url)
			await page.goto(url)
	}

	/**
	 * unload plugin
	 * @param {Object} outputContext
	 */
	async unload(outputContext) {
		const oc = outputContext || this.outputContext
		const o = oc.output
		const margin = ' '.repeat(oc.margin + oc.marginBase)
	}
}
