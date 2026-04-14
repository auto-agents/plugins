const querystring = require('node:querystring');

export default class GoogleScraper {

    constructor(ctx, plugin, config) {
        this.ctx = ctx
        this.config = plugin.config.scrappers.google
        if (config)
            this.config = {
                ...this.config
                , ...config
            }
        this.plugin = plugin
    }

    async run(query) {
        const url = this.config.queryUrl.replace(
            '{search_query}',
            querystring.escape(query))
        const page = await this.plugin.openPage(url)
    }
} 