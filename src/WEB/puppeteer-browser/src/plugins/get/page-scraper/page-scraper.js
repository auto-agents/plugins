import PupeteerPlugin from "../../../components/puppeteer-plugin"
import ScraperError from "../../../components/ScraperError"
import { Mutex } from 'async-mutex';
import { output, wait } from "../../../../../../../../shared/src/utils/utils";

export default class PageScraper extends PupeteerPlugin {

    static tabsCount = 0
    static scrapMutex = new Mutex()

    constructor(ctx, plugin, config, outputContext) {
        super(ctx, plugin, config, outputContext, __dirname)
    }

    // linked page (shared throught scrapers)
    static pagesInfos = {}
    static pagesInfosByUrl = {}

    async run(dcx, url) {
        const o = this.outputContext.output
        output(dcx, 'scrap page at: ' + url)

        // 1. open the page

        var pageInfo = null
        var page = null
        var differed = false
        var openNewTab = false

        while (pageInfo == null) {

            try {

                await PageScraper.scrapMutex.runExclusive(async () => {

                    const pageByUrl = this.plugin.config.plugins.get.getOptions.reusePage ?
                        PageScraper.pagesInfosByUrl[url] : null
                    const pageRecyclables = Object.values(PageScraper.pagesInfos)
                        .filter(x => !x.owner)
                    const pageRecyclableAvailable = pageRecyclables.length > 0

                    openNewTab = false

                    if (pageByUrl) {

                        // reuse page with same url

                        pageInfo = pageByUrl
                        page = pageInfo.page
                        output(dcx, `page #${page.id}: skip load (reuse existing url)`)
                        await page.bringToFront()
                        output(dcx, `page #${page.id} focused`)
                    }
                    else {
                        if (pageRecyclableAvailable) {

                            // reuse page available

                            pageInfo = pageRecyclables[0]
                            page = pageInfo.page
                            await page.goto(url)
                            await super.importScripts(page)
                            await page.bringToFront()
                            page.owner = this
                            output(dcx, `page #${page.id} loaded (recycled)`)
                        }
                    }

                    if (pageInfo)
                        pageInfo.owner = this
                    else {
                        openNewTab = PageScraper.tabsCount < this.plugin.config.plugins.get.getOptions.maxTabs
                        if (openNewTab)
                            PageScraper.tabsCount++
                    }
                })

                if (!pageInfo) {
                    if (openNewTab) {
                        // add a new page
                        output(dcx, `opening page (tabs=${PageScraper.tabsCount})`)
                        pageInfo = await this.plugin.openPage(url)
                        await super.importScripts(pageInfo.page)
                        pageInfo.owner = this
                        await PageScraper.scrapMutex.runExclusive(async () => {
                            PageScraper.pagesInfos[pageInfo.id] = pageInfo
                            PageScraper.pagesInfosByUrl[url] = pageInfo
                            output(dcx, `page ${pageInfo.id} opened (tabs=${PageScraper.tabsCount})`)
                        })
                        page = pageInfo.page
                    }
                }

                if (pageInfo != null) {

                    // 2. scrap content

                    await page.bringToFront()
                    const scrapContentScript = this.#getScript(this.config.scripts.scrapContent)
                    const res = await page.evaluate(scrapContentScript)

                    pageInfo.content = res
                    output(dcx, 'page ' + pageInfo.id + ' done ✔️')
                    return pageInfo
                }

                // no page available yet
                if (!differed) {
                    output(dcx, 'differ scrap...')
                    differed = true
                }
                await wait(this.plugin.config.plugins.get.getOptions.differDelay)
            }
            catch (err) {

                // free the page
                if (pageInfo != null) {
                    pageInfo.owner = null
                }
                throw new ScraperError(err)
            }
        }
    }

    #getScript(name) {
        return super.getScriptWithTransform(
            name,
            x => this.#configScript(x))
    }

    #configScript(script) {
        return script
    }
}