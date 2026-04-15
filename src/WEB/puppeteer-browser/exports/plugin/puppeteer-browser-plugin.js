import puppeteer from 'puppeteer'
import { toJson } from './../../../../../../shared/src/utils/utils';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

export const PUPPETEER_PID = 'PUPPETEER_PID'
export const PUPPETEER_WSE = 'PUPPETEER_WSE'
export const PUPPETEER_ARGS = 'PUPPETEER_ARGS'
export const PUPPETEER_CMD = 'PUPPETEER_CMD'

export default class PuppeteerBrowserPlugin {

	browser = null
	pages = {}
	pageId = 0
	scrapers = {}
	scraperId = 0

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
		return this.outputContext.output
	}

	#s() {
		return this.ctx.components.session.session
	}

	async openBrowser() {
		const browserPath = this.ctx.shell.browserChrome.path[
			this.ctx.shell.platform
		]
		if (this.config.detached) {
			// attempt to find a running instance
			this.browser = await puppeteer.connect({
				browserWSEndpoint: this.config.detachedInstance.wse
			})
		}
		else
			this.browser = await puppeteer.launch({
				executablePath: browserPath,
				browser: 'chrome',
				headless: this.config.headless,
				devtools: this.config.devtools,
				dumpio: false
			})
		const o = this.#o()
		const s = this.#s()
		const m = this.outputContext.getMargin()

		const wse = this.browser.wsEndpoint()
		o.appendLine(m + 'browser ws endpoint: ' + wse)
		const proc = this.browser.process()
		var pid = null
		if (proc) {
			pid = proc.pid
			o.appendLine(m + 'browser pid: ' + pid)
		}

		s.vars.set(PUPPETEER_PID, pid)
		s.vars.set(PUPPETEER_WSE, wse)
		s.vars.set(PUPPETEER_ARGS,
			proc ? toJson(proc.spawnargs)
				: toJson(this.config.detachedInstance.cmd))
		s.vars.set(PUPPETEER_CMD,
			proc ? proc.spawnargs.join(' ')
				: this.config.detachedInstance.line
		)
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
		if (this.config.focusOnOpenPage)
			await page.bringToFront()
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
	 * perform a query using a scrapper
	 * @param {String} query user query
	 * @param {String} browser browser id
	 */
	async search(query, browser) {
		const bconf = this.config.scrappers[browser]
		if (!bconf) throw new Error('browser config not found: ' + browser)
		const path = join(dirname(this.specification.file),
			this.config.paths.scrapers,
			browser,
			bconf.file)
		if (!existsSync(path)) throw new Error('scraper file not found: ' + path)
		const scraperMod = await import(path)
		const scraper = new scraperMod.default(
			this.ctx,
			this,
			this.config.scrappers.google,
			this.outputContext
		)
		this.#o().appendLine('added scraper: ' + this.scraperId)
		this.scrapers[this.scraperId++] = scraper
		await scraper.run(query)
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
