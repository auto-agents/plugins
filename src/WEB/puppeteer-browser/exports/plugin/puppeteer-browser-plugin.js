import puppeteer from 'puppeteer'
import { toJson } from './../../../../../../shared/src/utils/utils';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { AppExitingEvent, errorEvent, LogErrorEvent, LogWarningEvent } from '../../../../../../shared/src/data/events';

export const PUPPETEER_PID = 'PUPPETEER_PID'
export const PUPPETEER_WSE = 'PUPPETEER_WSE'
export const PUPPETEER_ARGS = 'PUPPETEER_ARGS'
export const PUPPETEER_CMD = 'PUPPETEER_CMD'

export default class PuppeteerBrowserPlugin {

	browser = null
	pages = {}
	pageId = 0
	plugins = {}
	pluginId = 0

	constructor(ctx, config, outputContext, pluginSpec, overloadConfig = null) {
		this.config = config
		this.specification = pluginSpec
		this.ctx = ctx
		this.outputContext = outputContext
		this.overloadConfig = overloadConfig

		this.ctx.cli.onExiting.push(async () => await this.#exit())
	}

	async #exit() {
		for (const [id, page] of Object.entries(this.pages)) {
			this.#o().appendLine('closing page: ' + id)
			await this.closePage(id)
			this.#o().appendLine('done ✔️')
		}
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
		const page = await this.browser.newPage()
		await page.setViewport({
			width: this.config.viewport.width,
			height: this.config.viewport.height
		})
		if (url)
			await page.goto(url)
		if (this.config.focusOnOpenPage)
			await page.bringToFront()
		const id = this.pageId
		this.pageId++
		this.pages[id] = page
		page.id = id
		return { page: page, id: id }
	}

	async closePage(id) {
		if (!this.pages[id]) throw new Error('page id not found: ' + id)
		await this.pages[id].close()
		delete this.pages[id]
		return
	}

	async #getPlugin(category, name, config) {
		const path = join(dirname(this.specification.file),
			this.config.paths.plugins,
			category,
			name,
			config.file)
		if (!existsSync(path)) throw new Error('plugin file not found: ' + path)
		const pluginMod = await import(path)
		const plugin = new pluginMod.default(
			this.ctx,
			this,
			config,
			this.outputContext
		)
		this.#o().appendLine('added plugin: ' + plugin + ' #' + this.pluginId)
		const id = this.pluginId++
		this.plugins[id] = plugin
		plugin.id = id
		return plugin
	}

	/**
	 * perform a query using a scrapper
	 * @param {String} query user query
	 * @param {String} browser browser id
	 * @param {Object} options specific actions options 
	 * @param {number} pluginId id of an existing scraper
	 */
	async search(query, plugin, options, pluginId) {

		const o = this.outputContext.output
		const config = this.config.plugins.search[plugin]
		if (!config) throw new Error('browser config not found: ' + browser)

		const scraper = await this.#getPlugin(
			this.config.paths.searchPlugins,
			plugin,
			config)

		var result = null
		try {
			result = await scraper.run(query)
		}
		catch (err) {
			this.#err(err)
		}

		return {
			id: scraper.id,
			scraper: scraper,
			result: result
		}
	}

	#err(err) {
		const e = this.ctx.components.event
		e.emit(LogErrorEvent,
			errorEvent(this.pluginName,
				err))
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
