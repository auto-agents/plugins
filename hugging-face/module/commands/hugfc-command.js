import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../shared/src/commands/command.js'
import { renderMd } from '../../../../shared/src/utils/decorators.js'

export default class HugfcCommand extends Command {

	constructor(ctx) {
		super(ctx, 'hugfc com')
	}

	async run(args, com) {
		const output = this.ctx.components.output

		const argAction = 'action'
		const action = this.getPositionalArg(com, args, argAction, 0)
		if (!this.checkParameter(com, argAction, action))
			return

		const argName = 'name'
		const getModelName = () => {
			return this.getValue(com, args, argName)
				|| this.getPositionalArg(com, args, argName, 1)
		}

		switch (action) {

			case 'card':
				{
					const name = getModelName()
					if (!name) {
						this.parameterMissing(argName)
						return
					}

					const scriptPath = path.join(
						process.cwd(),
						this.ctx.paths.modules,
						'hugging-face',
						'src',
						'get_model_card',
						'cli.py'
					)

					await new Promise((resolve) => {
						const py = spawn('python', [scriptPath, name], {
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
							this.emitCommandError(err?.message || String(err))
							resolve()
						})

						py.on('close', async (code) => {
							if (code !== 0) {
								this.emitCommandError((stderr || stdout || '').trim() || `python exited with code ${code}`)
								resolve()
								return
							}

							try {
								const rendered = renderMd(stdout || '')
								output.newLine()
								rendered.split('\n').forEach(line => output.appendLine(line))
							} catch (err) {
								this.emitCommandError(err?.message || String(err))
							}
							resolve()
						})
					})

					break
				}

			case 'fetch':
				{
					const output = this.ctx.components.output
					const url = this.ctx.modules?.huggingFace?.config?.urls?.fetchModels
					if (!url) {
						this.emitCommandError("missing url: this.ctx.modules.huggingFace.config.urls.fetchModels")
						return
					}

					let res = null
					try {
						res = await fetch(url)
					} catch (err) {
						this.emitCommandError(err?.message || String(err))
						return
					}

					if (!res.ok) {
						this.emitCommandError(`fetch error: ${res.status} ${res.statusText}`)
						return
					}

					let json = null
					try {
						json = await res.json()
					} catch (err) {
						this.emitCommandError(err?.message || String(err))
						return
					}

					this.ctx.modules.huggingFace.models = json

					const count = Array.isArray(json) ? json.length : (json ? Object.keys(json).length : 0)
					output.newLine()
					output.appendLine(`models founded: ${count}`)

					const name = getModelName()
					if (name && Array.isArray(json)) {
						const found = json.find(m => m?.id === name || m?.modelId === name || m?.name === name)
						if (found) {
							try {
								const rendered = renderMd('```json\n' + JSON.stringify(found, null, 2) + '\n```')
								rendered.split('\n').forEach(line => output.appendLine(line))
							} catch (err) {
								this.emitCommandError(err?.message || String(err))
							}
						} else {
							output.appendLine(`model not found: ${name}`)
						}
					}

					break
				}

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}
}
