import { join } from "node:path"
import PupeteerPlugin from "../../../components/puppeteer-plugin"
import ScraperError from "../../../components/ScraperError"
import { readFileSync } from "node:fs"

export default class PageScraper extends PupeteerPlugin {

    constructor(ctx, plugin, config, outputContext) {
        super(ctx, plugin, config, outputContext)
    }

    // TODO:: multiple page model, run(...) can have multiple // calls
    // linked page
    pagesInfos = {}
    pagesInfosByUrl = {}

    async run(url) {
        const o = this.outputContext.output
        const usePage = this.plugin.config.plugins.get.getOptions.reusePage
            && this.pagesInfosByUrl[url] != null

        o.appendLine('scrap page at: ' + url)
        try {

            // 1. open the page

            var pageInfo = null
            var page = null
            if (usePage) {
                pageInfo = this.pagesInfosByUrl[url]
                page = pageInfo.page
                await page.bringToFront()

                if (pageInfo.url != url)
                    await page.goto(url)
                else
                    o.appendLine(`page #${page.id}: skip load (reuse)`)

                o.appendLine(`page #${page.id} focused`)
            }
            else {
                pageInfo = await this.plugin.openPage(url)
                this.pagesInfos[pageInfo.id] = pageInfo
                this.pagesInfosByUrl[url] = pageInfo
                o.appendLine(`page ${pageInfo.id} opened`)
                page = this.page = pageInfo.page
            }

            // 2. scrap content

            const scrapContentScript = this.#getScript(this.config.scripts.scrapContent)
            const res = await page.evaluate(scrapContentScript)

            pageInfo.content = res
            o.appendLine('done ✔️')
            return pageInfo

        } catch (err) {
            throw new ScraperError(err.message)
        }
    }

    #getScript(name) {
        const scriptsPath = join(
            __dirname,
            this.config.scriptsPath
        )
        const runQueryScript = this.#configScript(
            readFileSync(
                join(scriptsPath, name)
            ).toString())
        return runQueryScript
    }

    #configScript(script) {
        return script
    }
}