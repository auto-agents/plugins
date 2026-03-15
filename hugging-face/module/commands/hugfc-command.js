import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../cli/source/commands/command.js'
import { CommandRunErrorEvent, errorEvent } from '../../../../cli/source/config/events.js'

export default class HugfcCommand extends Command {

	constructor(ctx) {
		super(ctx, 'hugfc com')
	}

	async run(args, com) {
		const e = this.ctx.components.event
		const output = this.ctx.components.output

		const argAction = 'action'
		const action = this.getPositionalArg(com, args, argAction, 0)
		if (!this.checkParameter(com, argAction, action))
			return

		switch (action) {
			case 'card':

				const argName = 'name'
				const name = this.getValue(com, args, argName)
				if (!this.checkParameter(com, argName, name))
					return

				const scriptPath = path.join(
					process.cwd(),
					this.ctx.paths.modules,
					'hugging-face',
					'src',
					'get_model_card',
					'cli.py'
				)

				await new Promise((resolve) => {
					const py = spawn('python', [scriptPath, modelName], {
						windowsHide: true
					})

					let stdout = ''
					let stderr = ''

					py.stdout.on('data', (d) => {
						stdout += d.toString()
					})
					py.stderr.on('data', (d) => {
						stderr += d.toString()
					})

					py.on('error', (err) => {
						e.emit(CommandRunErrorEvent, {
							...errorEvent(this.From, err),
							cmd: this.From
						})
						resolve()
					})

					py.on('close', async (code) => {
						if (code !== 0) {
							e.emit(CommandRunErrorEvent, {
								...errorEvent(this.From, new Error((stderr || stdout || '').trim() || `python exited with code ${code}`)),
								cmd: this.From
							})
							resolve()
							return
						}

						try {
							const { renderMarkdown } = await import('cli-html')
							const rendered = renderMarkdown(stdout || '')
							output.newLine()
							rendered.split('\n').forEach(line => output.appendLine(line))
						} catch (err) {
							e.emit(CommandRunErrorEvent, {
								...errorEvent(this.From, err),
								cmd: this.From
							})
						}
						resolve()
					})
				})

				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}
}
