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

		switch (action) {

			case 'open':
				if (!url) {
					this.parameterMissing(argUrl)
					return
				}

				o.appendLine('open browser at: ' + url)
				const pageInfo = await plugin.openPage(url)
				o.appendLine('done ✔️ page id = ' + pageInfo.id)
				break

			case 'close':
				if (!id) {
					this.parameterMissing(argId)
					return
				}
				o.appendLine('close browser page #' + id)
				await plugin.closePage(id)
				o.appendLine('done ✔️')
				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}
}
