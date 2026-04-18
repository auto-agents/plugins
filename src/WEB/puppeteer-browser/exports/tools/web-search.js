import AITool from "../../../../../../shared/src/components/ai-tools/ai-tool"
import Logger from "../../../../../../shared/src/components/sys/logger"
import { cmd, mdBlockJson, nonEmpty, toJson } from "../../../../../../shared/src/utils/utils"

export default class WebSearchTool extends AITool {

    constructor(ctx, config) {
        super(ctx, config)
    }

    specification() {
        return {
            name: 'web_search',
            description: 'search information on internet using an online search engine',
            parameters: {
                type: "object",
                properties: {
                    "query": {
                        "type": "string",
                        "description": "the query to provide to the search engine"
                    },
                    "engine": {
                        "description": "the search engine that must be used",
                        "type": "string",
                        "enum": ["google"],
                        "default": "google"
                    }
                }
            },
            required: ["query"]
        }
    }

    async run(args) {
        const id = args.engine || 'google'
        var query = args.query
        const o = this.ctx.components.output

        // /pup search {id} {query} -g default -d
        query = query.replaceAll('"', '')
        const res = await cmd(this.ctx,
            'puppeteer', 'search', id,
            '"' + query + '"', '-g', 'default', '-d')

        if (res instanceof Error) {
            // search error
            return this.jsonPlainResult(
                {
                    error: res.message || res.toString() || res
                }
            )
        }

        const r = res.searchResult && Object.getOwnPropertyNames(res.searchResult).length > 0 ?
            res.searchResult : null
        if (!r) {
            return this.jsonPlainResult({
                query_results: 'no result found'
            })
        }

        var jsonResult = false

        var instruct = '# ' + query + '\n\n'
        instruct +=
            'This is the content of the web pages returned from the search engine, as a json object, for the query: **' + query + '**.\n'
            + 'Each page content is described in the property `query_results.pages[pageId]`, with the schema: `{url,title,lang,text}`' + '.\n'
            + 'Extract the most relevant texts related to the query from the properties `text` and `summary`' + '.\n'
            + 'Respond with a summary of maximum 10 lines.\n'
            + "If you don't find any relevant information in the provided results, just indicates it, do not performs another search.\n"
            + '\n'

        const dat = {
            query_results: {
                pages: []
            }
        }

        for (const [pageNumber, sp] of Object.entries(res.searchResult)) {

            var hasContent = false

            for (const [linkNumber, cp] of Object.entries(sp.content)) {

                var txt = ''
                if (cp?.content?.sections)
                    for (const [secKey, sec] of Object.entries(cp.content.sections))
                        txt += sec + '\n\n'

                hasContent = nonEmpty(txt)

                if (hasContent) {
                    dat.query_results.pages.push({
                        url: cp?.url,
                        title: cp?.content?.title,
                        lang: cp?.content?.lang,
                        text: txt,
                        id: pageNumber + '-' + linkNumber
                    })
                    this.ctx.components.output.appendLine('add link result: sp #' + pageNumber + ', link #' + linkNumber + ', length=' + txt.length)
                }
            }

            if (nonEmpty(sp.aiContent)) {
                if (dat.query_results.summary)
                    dat.query_results.summary = dat.query_results.summary + sp.aiContent
                else
                    dat.query_results.summary = sp.aiContent

                this.ctx.components.output.appendLine('add aiContent result: sp #' + pageNumber)
            }
        }

        if (nonEmpty(dat.query_results.summary)) {
            instruct += '## Summary\n\n' + dat.query_results.summary + '\n\n'
        }

        instruct += '## pages data\n\n'

        const trt = instruct + mdBlockJson(toJson(dat))
        const rt = this.textResult(trt)
        //Logger.log(trt)
        return rt
    }
}
