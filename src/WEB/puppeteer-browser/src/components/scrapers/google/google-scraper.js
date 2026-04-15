import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSessionVars, toJson } from '../../../../../../../../shared/src/utils/utils';
import ScraperError from '../ScraperError';
//import puppeteer from 'puppeteer-core'

const querystring = require('node:querystring');

const CAPTCHA_BEFORE_HOME_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const CAPTCHA_BEFORE_RESULT_PAGE = 'CAPTCHA_BEFORE_HOME_PAGE'
const RESULT_PAGE = 'RESULT_PAGE'

export default class GoogleScraper {

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

    async run(query) {

        try {
            const o = this.outputContext.output
            const url = this.config.queryUrl.replace(
                '{search_query}',
                querystring.escape(query))

            // 1. open the search home page

            o.newLine()
            o.appendLine('1. open page at url: ' + url)
            const pageInfo = this.pageInfo = await this.plugin.openPage(url)
            o.appendLine(`page ${pageInfo.id} opened`)
            const page = pageInfo.page

            // 2. launch the search query

            o.appendLine('2. run query')
            const runQueryScript = this.#getScript(this.config.scripts.runQuery, query)
            var r = await page.evaluate(runQueryScript)

            if (r != RESULT_PAGE) {
                const m = 'blocked by: ' + r
                throw new ScraperError(m, r)
            }
            else
                o.appendLine(r)

            // 3 . scrap results

            await page.waitForNetworkIdle()

            const scrapResultsScript = this.#getScript(this.config.scripts.scrapResults, null)
            r = await page.evaluate(scrapResultsScript)

            if (typeof r === 'string') {
                const m = 'blocked by: ' + r
                throw new ScraperError(m, r)
            }

            getSessionVars(this.ctx).set('search', r)
            o.appendLine('success ✔️')
            return r

        } catch (err) {
            if (err instanceof ScraperError)
                throw err
            else
                throw new ScraperError(err.message)
        }
    }
} 