import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../shared/src/commands/command.js'
import { renderMd } from '../../../../shared/src/utils/decorators.js'
import { Table } from 'console-table-printer';

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
					const mod = this.ctx.components.module.huggingFace
					const url = mod.config?.urls?.fetchModels
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

					mod.models = json
					//console.log(json)

					const count = Array.isArray(json) ? json.length : (json ? Object.keys(json).length : 0)
					output.newLine()
					output.appendLine(`models founded: ${count}`)

					output.newLine()

					const cnt = mod.config.maxFetchResults
					const t = this.toLittleArray(json, cnt)

					const p = new Table({
						columns: [
							{ name: "id", alignment: "left", maxlen: 20 },
							{ name: "dn", alignment: "left" },
							{ name: "lk", alignment: "left" },
							{ name: "tags", alignment: "left", maxLen: 30 },
						]
					});

					for (var i = 0; i < cnt; i++) {
						//output.appendLine(this.toStr(t[i]))
						const r = t[i]
						p.addRow(r)
					}
					output.appendLine(p.render())


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

	toLittleArray(json, max) {
		const t = []
		for (var i = 0; i < max; i++) {
			t.push(this.toLittleJson(json[i]))
		}
		return t
	}

	toLittleJson(modelInfo) {
		var id = modelInfo.id
		var aut = ''
		const t = id.split('/')
		if (t.length > 1) {
			aut = t[0]
			id = t[1]
		}

		return {
			id: id,
			dn: modelInfo.downloads,
			lk: modelInfo.likes,
			tags: modelInfo.tags
				.filter(x =>
					x.length > 2
					&& !x.includes('region')
					&& !x.includes('license')
					&& !x.includes('arxiv')
					&& !x.includes('dataset')
					&& !x.includes('base_model')
					&& !x.includes('deploy')
				)
				.join(', ')
		}
	}

	strHeader() {
		return 'id | downloads | likes | tags'
	}

	toStr(modelInfo) {
		return `${modelInfo.id} | ${modelInfo.downloads} | ${modelInfo.likes} | ${modelInfo.mainTags}`
	}
}
