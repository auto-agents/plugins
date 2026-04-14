import puppeteer from 'puppeteer'
import { toJson } from './../../../../../../shared/src/utils/utils';

export const PUPPETEER_PID = 'PUPPETEER_PID'
export const PUPPETEER_WSE = 'PUPPETEER_WSE'
export const PUPPETEER_ARGS = 'PUPPETEER_ARGS'

export default class PuppeteerBrowserPlugin {

	browser = null
	pageId = 0
	pages = {}

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
		await this.openBrowser()
	}

	#o() {
		return this.ctx.components.output
	}

	#s() {
		return this.ctx.components.session.session
	}

	async openBrowser() {
		const browserPath = this.ctx.shell.browserChrome.path[
			this.ctx.shell.platform
		]
		this.browser = await puppeteer.launch({
			executablePath: browserPath,
			browser: 'chrome',
			headless: this.config.headless,
			devtools: this.config.devtools,
			dumpio: false
			//waitForInitialPage: true
		})
		const o = this.#o()
		const s = this.#s()

		const wse = this.browser.wsEndpoint()
		o.appendLine('browser ws endpoint: ' + wse)
		const proc = this.browser.process()
		const pid = proc.pid
		o.appendLine('browser pid: ' + pid)

		s.vars.set(PUPPETEER_PID, pid)
		s.vars.set(PUPPETEER_WSE, wse)
		s.vars.set(PUPPETEER_ARGS, toJson(proc.spawnargs))
	}

	/**
	 * opens an new page on url. fits the viewport
	 * @param {String} url 
	 * @returns {Object} { page: page, id: page_id }
	 */
	async openPage(url) {
		const id = this.pageId
		this.pageId++
		const page = await this.browser.newPage()
		await page.setViewport({
			width: this.config.viewport.width,
			height: this.config.viewport.height
		})
		if (url)
			await page.goto(url)
		this.pages[id] = page
		return { page: page, id: id }
	}

	async closePage(id) {
		if (!this.pages[id]) throw new Error('page id not found: ' + id)
		await this.pages[id].close()
		delete this.pages[id]
		return
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
