import Command from '../../../../../../shared/src/commands/command.js'

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

		switch (action) {

			case 'search':
				if (!id) {
					this.parameterMissing(argId)
					return
				}
				if (!text) {
					this.parameterMissing(argText)
					return
				}
				o.newLine()
				o.appendLine('launch browser search with: ' + id)
				const r = await plugin.search(text, id)
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
				await pageInfo.page.evaluate('console.log("ici")')
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
	}
}
