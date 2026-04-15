import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toJson } from '../../../../../../../../shared/src/utils/utils';
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
            .replaceAll('{includeYouTubeResults}', this.config.includeYouTubeResults)
            .replaceAll('{excludeEmptyTopics}', this.config.excludeEmptyTopics)
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
        const r = await page.evaluate(runQueryScript)

        if (r != RESULT_PAGE) {
            o.appendLine('blocked by: ' + r)
            return
        }
        else
            o.appendLine(r)

        // 3 . scrap results

        await page.waitForNetworkIdle()

        const scrapResultsScript = this.#getScript(this.config.scripts.scrapResults, null)
        const rs = await page.evaluate(scrapResultsScript)

        o.appendLine('result: ' + toJson(rs))
    }
} 