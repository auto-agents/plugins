import { getSessionVars, output } from '../../../../../../../../shared/src/utils/utils';
import ScraperError from '../../../components/ScraperError';
import { PUPPETEER_ACTION_GET, PUPPETEER_ACTION_SEARCH } from '../../../../exports/plugin/puppeteer-browser-plugin';
import Status from '../../../../../../../../shared/src/utils/status';
import PupeteerPlugin from '../../../components/puppeteer-plugin';
//import puppeteer from 'puppeteer-core'

const querystring = require('node:querystring');

const CAPTCHA_BEFORE_HOME_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const CAPTCHA_BEFORE_RESULT_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const RESULT_PAGE = 'RESULT_PAGE'

export default class GoogleScraper extends PupeteerPlugin {

    // linked page
    page = null
    // last search results
    search = null
    // last scrap results
    scraps = null
    // browse plugin
    getPlugins = {}

    getPlugin(id, pluginGetName, pluginGet) {
        return { pluginGetName: pluginGetName, id: id, pluginGet: pluginGet }
    }

    constructor(ctx, plugin, config, outputContext) {
        super(ctx, plugin, config, outputContext, __dirname)
        this.status = new Status(ctx)
    }

    #configScript(script, query) {
        return script
            .replaceAll('{query}', query)
            .replaceAll('{catchaPathName}', this.config.pathNames.captcha)
            .replaceAll('{minimumPauseDelay}', this.config.minimumPauseDelay)
            .replaceAll('{minimumKbdDelay}', this.config.minimumKbdDelay)
            .replaceAll('{includeYouTubeResults}', this.config.includeYouTubeResults)
            .replaceAll('{excludeEmptyTopics}', this.config.excludeEmptyTopics)
            .replaceAll('{excludeEmptyTopics}', this.config.excludeEmptyTopics)
            .replaceAll('{excludedResultUrls}', JSON.stringify(this.config.excludedResultUrls))
            .replaceAll('{skipResults}', this.config.skipResults)
            .replaceAll('{CAPTCHA_BEFORE_HOME_PAGE}', CAPTCHA_BEFORE_HOME_PAGE)
            .replaceAll('{CAPTCHA_BEFORE_RESULT_PAGE}', CAPTCHA_BEFORE_RESULT_PAGE)
            .replaceAll('{RESULT_PAGE}', RESULT_PAGE)
    }

    #getScript(name, query) {
        return super.getScriptWithTransform(
            name,
            x => this.#configScript(x, query))
    }

    async run(dcx, query, usePage, options) {

        switch (options.action) {
            case PUPPETEER_ACTION_SEARCH:
                return await this.#search(dcx, query, usePage, options)

            case PUPPETEER_ACTION_GET:
                return await this.#get(dcx, options)

            default:
                throw new Error('invalid action: ' + options.action)
        }
    }

    async #get(dcx, options) {
        // get or build a single browse task
        const o = this.outputContext.output
        const getTask = await this.#getGetPlugin(options)
        const pagesTasks = []

        options.browseSearchPages.forEach(pageIndex => {
            const searchPage = this.search[pageIndex]
            const pageInfos = {}
            if (searchPage) {

                const pageTask = async () => {
                    const results = searchPage.results
                    var itemIndex = 0
                    var itemCount = 0
                    const tasks = []
                    const errors = []
                    if (!this.search[pageIndex].errors)
                        this.search[pageIndex].errors = []
                    results.forEach(item => {
                        if (item.href &&
                            (!options.limitResults
                                || options.limitResults == 0
                                || itemCount < options.limitResults)) {
                            const task = async (item) => {

                                const n = item.index
                                try {
                                    const pageInfo = await getTask.pluginGet.run(dcx, item.href)
                                    pageInfos[n] = { ...pageInfo }
                                    // release page (tab)
                                    pageInfo.owner = null
                                } catch (err) {
                                    output(dcx, this.status.error('scrap link #' + n + ' failed: ' + err.message))
                                    errors.push({
                                        link: n,
                                        message: err.message
                                    })
                                }
                            }
                            tasks.push(task(item))
                            itemCount++
                        }
                        itemIndex++
                    })
                    await Promise.all(tasks)

                    output(dcx, 'get done ✔️')
                    this.scraps = pageInfos
                    this.search[pageIndex].content = { ...this.scraps }
                    this.search[pageIndex].errors = errors
                }
                pagesTasks.push(pageTask())

            } else
                output(dcx, this.status.warning('page not available: #' + pageIndex))
        });

        await Promise.all(pagesTasks)
        return this.search
    }

    async #getGetPlugin(options) {
        if (!this.search) throw new Error('no search results available')

        const o = this.outputContext.output
        const t = Object.values(this.getPlugins)
            .filter(x => x.pluginGetName == options.pluginGetName)
        var task = null
        if (t.length > 0) {
            task = t[0]
            o.appendLine('reuse get task "' + task.pluginGetName + '": #' + task.id)
        }
        else {
            task = await this.#getNewGetPlugin(options)
            this.getPlugins[task.id] = task
            o.appendLine('add new get task "' + task.pluginGetName + '": #' + task.id)
        }
        return task
    }

    async #getNewGetPlugin(options) {
        var id = 0
        const tasks = Object.values(this.getPlugins)
        if (tasks.length > 0)
            id = Math.max(...tasks.map(x => x.id)) + 1
        const pluginGet = await this.plugin.getPlugin(
            this.plugin.config.paths.getPlugins,
            options.pluginGetName,
            this.plugin.config.plugins[this.plugin.config.paths.getPlugins][options.pluginGetName]
        )
        const task = this.getPlugin(id, options.pluginGetName, pluginGet)
        return task
    }

    async #search(dcx, query, usePage, options) {
        try {
            const pageIndex = 1
            //const o = this.outputContext.output
            const url = this.config.queryUrl.replace(
                '{search_query}',
                querystring.escape(query))

            query = query.replaceAll("'", "\\'")

            // 1. open the search home page

            output(dcx, '\n1. open page at url: ' + url)
            var page = null
            if (usePage) {
                page = this.page
                await page.bringToFront()
                await page.goto(url)
                await super.importScripts(page)
                output(dcx, `page #${page.id} focused`)
            }
            else {
                const pageInfo = this.pageInfo = await this.plugin.openPage(url)
                await super.importScripts(pageInfo.page)
                output(dcx, `page #${pageInfo.id} opened`)
                page = this.page = pageInfo.page
            }

            // 2. launch the search query

            output(dcx, '2. run query')
            const runQueryScript = this.#getScript(this.config.scripts.runQuery, query)
            var r = null

            const res = await Promise.all([
                page.waitForNavigation(),
                page.evaluate(runQueryScript)
            ])
            if (res.length > 1) r = res[1]

            if (r != RESULT_PAGE) {
                const m = 'blocked by: ' + r
                throw new ScraperError(m, r)
            }
            else
                output(dcx, r)

            // 3 . scrap results

            const scrapResultsScript = this.#getScript(this.config.scripts.scrapResults, null)
            await super.importScripts(page)
            r = await page.evaluate(scrapResultsScript)

            if (typeof r === 'string') {
                const m = 'blocked by: ' + r
                throw new ScraperError(m, r)
            }

            r.query = query
            r = { [pageIndex]: r }
            getSessionVars(this.ctx).set('search', r)
            output(dcx, 'success ✔️')

            this.search = r
            return r

        } catch (err) {
            if (err instanceof ScraperError)
                throw err
            else
                throw new ScraperError(err.message)
        }
    }
} 