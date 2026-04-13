export default class GoogleScraper {

    static querystring = require('node:querystring');

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

    run(query) {
        query = query.replace(
            '{search_query}',
            this.queryString.escape(query))
        const page = this.plugin.open()
    }
} s