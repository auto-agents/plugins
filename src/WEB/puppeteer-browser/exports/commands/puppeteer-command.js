import Command from '../../../../../../shared/src/commands/command.js';
import chalk from 'chalk'
import { PUPPETEER_ACTION_GET, PUPPETEER_ACTION_SEARCH, PUPPETEER_GET_ALL, PUPPETEER_GET_DEFAULT } from '../plugin/puppeteer-browser-plugin.js';

export default class PupeteerCommand extends Command {

	constructor(ctx) {
		super(ctx, 'puppeteer com')
	}

	async run(args, com) {
		const o = this.ctx.components.output
		const plugin = this.ctx.components.plugin.puppeteerBrowser

		const argAction = 'action'
		const action = this.getPositionalArg(com, args, argAction, 0)
		if (!this.checkParameter(com, argAction, action))
			return

		const argUrl = 'url'
		const url = this.getValue(com, args, argUrl)
			|| this.getPositionalArg(com, args, argUrl, 1)

		const argId = 'id'
		const id = this.getValue(com, args, argId)
			|| this.getPositionalArg(com, args, argId, 1)

		const argText = 'text'
		const text = this.getValue(com, args, argText)
			|| this.getPositionalArg(com, args, argText, 2)

		const argUse = 'plugin'
		const use = this.getValue(com, args, argUse)

		const argGet = 'get'
		const get = this.getValue(com, args, argGet)

		const argDeep = 'deep'
		const deep = this.getValue(com, args, argDeep)

		var cr = null

		const search = async (text, get, use) => {
			var opts = {
				action: PUPPETEER_ACTION_SEARCH
			}
			if (!id) {
				this.parameterMissing(argId)
				return
			}
			if (get && !text) {
				opts.action = PUPPETEER_ACTION_GET
				switch (get) {
					case PUPPETEER_GET_ALL:
						opts.browseSearchPages = [
							0, 1, 2, 3, 4, 5, 6, 7, 8, 9
						]
						break
					case PUPPETEER_GET_DEFAULT:
						break
					default:
						// pages list
						opts.browseSearchPages = get.split(',').map(x => eval(x))
						break
				}
			}
			if (opts.action == PUPPETEER_ACTION_SEARCH && !text) {
				this.parameterMissing(argText)
				return
			}

			o.newLine()
			o.appendLine('launch browser for action: ' + opts.action + ' with: ' + id +
				(use ? (', plugin #' + use) : ''))
			cr = await plugin.search(text, id, use, opts)
			return cr
		}

		switch (action) {

			case 'search':
				cr = await search(text, get, use)

				if (!get && plugin.config.dumpSearchResults) {
					const sr = cr?.searchResult
					if (sr?.results && sr.results.length > 0) {
						var n = 1
						if (sr?.aiContent && sr.aiContent.length > 0) {
							o.newLine()
							o.appendLine(chalk.hex(plugin.config.theme.resultItemSummary)(sr.aiContent.trim()))
						}
						o.newLine()
						sr.results.forEach(item => {
							if (item.topic && item.topic.length > 0)
								o.appendLine(
									chalk.hex(plugin.config.theme.resultItemNumber)((n++) + '. ')
									+ chalk.hex(plugin.config.theme.resultItemTopic)(item.topic.trim()) + '\n')
							if (item.summary && item.summary.length > 0)
								o.appendLine(chalk.hex(plugin.config.theme.resultItemSummary)(item.summary.trim()) + '\n')
						});
					}
				}

				if (deep)
					search(null, get, use)
				break

			case 'open':
				if (!url) {
					this.parameterMissing(argUrl)
					return
				}

				o.newLine()
				o.appendLine('open browser at: ' + url)
				const pageInfo = await plugin.openPage(url)
				o.appendLine('done ✔️ page id = ' + pageInfo.id)
				await pageInfo.page.evaluate('console.log("' + plugin.pluginName + ': page id #' + pageInfo.id + '")')
				cr = pageInfo
				break

			case 'close':
				if (!id) {
					this.parameterMissing(argId)
					return
				}
				o.newLine()
				o.appendLine('close browser page: ' + id)
				await plugin.closePage(id)
				o.appendLine('done ✔️')
				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}

		return cr
	}
}
