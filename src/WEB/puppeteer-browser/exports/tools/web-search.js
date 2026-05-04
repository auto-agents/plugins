import AITool from "../../../../../../shared/src/components/ai/tools/ai-tool"
import Logger from "../../../../../../shared/src/components/sys/logger"
import { cmd, mdBlockJson, nonEmpty, output, toJson } from "../../../../../../shared/src/utils/utils"
import { writeFileSync } from 'fs';

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

	async run(args, dialogContext) {
		const id = args.engine || 'google'
		var query = args.query
		const o = this.ctx.components.output

		// /pup search {id} {query} -g default -d
		query = query.replaceAll('"', '')
		const res = await cmd(
			dialogContext,
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
		var doc = instruct

		// instructs in results is not a good thing... currently deactivated
		instruct +=
			'This is the content of the web pages returned from the search engine, as a json object, for the query: **' + query + '**.\n'
			+ 'Each page content is described in the property `query_results.pages[pageId]`, with the schema: `{url,title,lang,text}`' + '.\n'
			+ 'the texts obtained from the search are grouped together for each page in the field `text`' + '.\n'
			/*+ 'Extract the most relevant texts related to the query from the properties `text` and `summary`' + '.\n'
			+ 'Respond in a json structure: \n'
			+ 'Includes a list of indicators of relevancy of each page result'
			+ '- includes a summary of maximum 10 lines.\n'
			+ '- includes the list of urls (qualified with a description) of the more relevants media audio, video and images\n'
			+ "If you don't find any relevant information in the provided results, just indicates it, do not performs another search.\n"
			+*/ '\n'

		doc +=
			'This is the content of the web pages returned from the search engine, for the query: **"' + query + '"**.\n'
			+ 'Each page content is described in the property `query_results.pages[pageId]`, with the schema: `{url,title,lang,text}`' + '.\n'
			+ 'the texts obtained from the search are grouped together for each page in the field `text`' + '.\n'

			/*+ '- Above the title a bullet list indicates document properties: \n\t- url,\n\t- title\n\t- lang\n\t- id' + '\n'
			+ '- Above the document properties after a line break is the location of the text of the document'
			+ 'Extract the most relevant texts related to the query from the properties `text` and `summary`' + '.\n'
			+ 'Respond with a summary of maximum 10 lines.\n'
			+ "If you don't find any relevant information in the provided results, just indicates it, do not performs another search.\n"
			*/+ '\n'

		const dat = {
			query_results: {
				pages: []
			}
		}

		var doc = '# Search results\n\n'

		for (const [pageNumber, sp] of Object.entries(res.searchResult)) {

			var hasContent = false

			doc += '## results page n°' + pageNumber
			if (dat.query_results.summary) {
				doc += '\n\n## summary: \n\n' + dat.query_results.summary
			}

			for (const [linkNumber, cp] of Object.entries(sp.content)) {

				var txt = ''
				/*if (cp?.content?.sections)
					for (const [secKey, sec] of Object.entries(cp.content.sections))
						txt += sec + '\n\n'*/
				txt = cp?.content?.text

				hasContent = nonEmpty(txt)

				if (hasContent && cp) {
					const id = pageNumber + '-' + linkNumber
					var d = {
						url: cp.url,
						title: cp.content?.title,
						lang: cp.content?.lang,
						text: txt,
						id: id
					}
					if (false) {
						// TODO: an option
						d = {
							...d,
							videos: cp.content.videos,
							images: cp.content.images,
							links: cp.content.links
						}
					}
					dat.query_results.pages.push(d)

					doc += '\n\n## ' + cp.content.title + '\n\n'
					doc += `- url: [${cp.url}](${cp.url})\n`
					doc += `- lang: ${cp.content.lang}\n`
					doc += `- id: ${id}\n`
					doc += '\n\n'
					doc += txt

					if (false) {
						doc += '\n\n### links\n\n'
						cp.content.links.forEach(link => {
							doc += `- ${link.description}\n`
							doc += `\t- ${link.url}\n`
						});

						doc += '\n\n### images\n\n'
						cp.content.images.forEach(img => {
							doc += `- ${img.description} - ${img.width}x${img.height}\n`
							doc += `\t- ${img.url}\n`
						});

						doc += '\n\n### videos\n\n'
						cp.content.videos.forEach(vid => {
							doc += `- ${vid.description} - ${vid.width}x${vid.height}\n`
							doc += `\t- ${vid.url}\n`
						});
					}

					doc += '\n\n'

					output(dialogContext,
						'add link result: sp #' + pageNumber + ', link #' + linkNumber + ', size=' + txt.length)
				}
			}

			if (nonEmpty(sp.aiContent)) {
				if (dat.query_results.summary)
					dat.query_results.summary = dat.query_results.summary + sp.aiContent
				else
					dat.query_results.summary = sp.aiContent

				output(dialogContext, 'add aiContent result: sp #' + pageNumber)
			}
		}

		if (nonEmpty(dat.query_results.summary)) {
			instruct += '## Summary\n\n' + dat.query_results.summary + '\n\n'
		}

		instruct += '## pages data\n\n'

		const trt = instruct + mdBlockJson(toJson(dat))
		const rt = this.textResult(trt)
		writeFileSync('tmp/search-results.json', toJson(res.searchResult))
		writeFileSync('tmp/search-response.md', doc)
		writeFileSync('tmp/search-response-json.md', trt)
		//const rt = this.textResult(doc)
		return rt
		//return this.jsonPlainResult(dat)	// json only
	}
}
