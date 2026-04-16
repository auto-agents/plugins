export default class PageScraper {

    constructor(ctx, plugin, config, outputContext) {
        this.ctx = ctx
        this.plugin = plugin
        this.config = config
        this.outputContext = outputContext
    }

    // host plugin (puppeteer or scraper)
    plugin = null
    // linked page
    page = null

    async run(options) {
    }
}