import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSessionVars } from '../../../../../../../../shared/src/utils/utils';
import ScraperError from '../../../components/ScraperError';
import { PUPPETEER_ACTION_GET, PUPPETEER_ACTION_SEARCH } from '../../../../exports/plugin/puppeteer-browser-plugin';
//import puppeteer from 'puppeteer-core'

const querystring = require('node:querystring');

const CAPTCHA_BEFORE_HOME_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const CAPTCHA_BEFORE_RESULT_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const RESULT_PAGE = 'RESULT_PAGE'

export default class GoogleScraper {

    // host plugin (puppeteer)
    plugin = null
    // linked page
    page = null
    // last search results
    search = null
    // browse plugin
    browseTasks = {}

    browseTask(id, pluginGetName, pluginGet) {
        return { pluginGetName: pluginGetName, id: id, pluginGet: pluginGet }
    }

    constructor(ctx, plugin, config, outputContext) {
        this.ctx = ctx
        this.plugin = plugin
        this.config = config
        this.outputContext = outputContext
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
        const scriptsPath = join(
            __dirname,
            this.config.scriptsPath
        )
        const runQueryScript = this.#configScript(
            readFileSync(
                join(scriptsPath, name)
            ).toString(), query)
        return runQueryScript
    }

    async run(query, usePage, options) {

        switch (options.action) {
            case PUPPETEER_ACTION_SEARCH:
                return await this.#search(query, usePage, options)

            case PUPPETEER_ACTION_GET:
                return await this.#get(options)

            default:
                throw new Error('invalid action: ' + options.action)
        }
    }

    async #get(options) {
        // get or build a single browse task
        const task = this.#getBrowseTask(options)
    }

    #getBrowseTask(options) {
        const o = this.outputContext.output
        const t = Object.values(this.browseTasks)
            .filter(x => x.pluginGetName == options.pluginGetName)
        var task = null
        if (t.length > 0) {
            task = t[0]
            o.appendLine('reuse get task "' + task.pluginGetName + '": #' + task.id)
        }
        else {
            task = this.#getNewBrowseTask(options)
            this.browseTasks[task.id] = task
            o.appendLine('add new browser task "' + task.pluginGetName + '": #' + task.id)
        }
        return task
    }

    #getNewBrowseTask(options) {
        var id = 0
        const tasks = Object.values(this.browseTasks)
        if (tasks.length > 0)
            id = Math.max(...tasks.map(x => x.id)) + 1
        const pluginGet = this.plugin.getPlugin(
            this.plugin.config.paths.getPlugins,
            options.pluginGetName,
            this.plugin.config.plugins[this.plugin.config.paths.getPlugins][options.pluginGetName]
        )
        const task = this.browseTask(id, options.pluginGetName, pluginGet)
        return task
    }

    async #search(query, usePage, options) {
        try {
            const o = this.outputContext.output
            const url = this.config.queryUrl.replace(
                '{search_query}',
                querystring.escape(query))

            // 1. open the search home page

            o.newLine()
            o.appendLine('1. open page at url: ' + url)
            var page = null
            if (usePage) {
                page = this.page
                await page.bringToFront()
                await page.goto(url)
                o.appendLine(`page ${page.id} focused`)
            }
            else {
                const pageInfo = this.pageInfo = await this.plugin.openPage(url)
                o.appendLine(`page ${pageInfo.id} opened`)
                page = this.page = pageInfo.page
            }

            // 2. launch the search query

            o.appendLine('2. run query')
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
                o.appendLine(r)

            // 3 . scrap results

            //await page.waitForNetworkIdle()

            const scrapResultsScript = this.#getScript(this.config.scripts.scrapResults, null)
            r = await page.evaluate(scrapResultsScript)

            if (typeof r === 'string') {
                const m = 'blocked by: ' + r
                throw new ScraperError(m, r)
            }

            r.query = query
            getSessionVars(this.ctx).set('search', r)
            o.appendLine('success ✔️')

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