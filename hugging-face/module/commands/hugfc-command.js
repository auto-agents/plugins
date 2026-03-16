import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../shared/src/commands/command.js'
import { renderMd } from '../../../../shared/src/utils/decorators.js'
import { Table } from 'console-table-printer'
import chalk from 'chalk'
import { RunCommandEvent } from '../../../../shared/src/data/events.js'

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
		const name = getModelName()

		switch (action) {

			case 'card':

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

			case 'fetch':

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

				// build and store result
				mod.models = json
				const count = Array.isArray(json) ? json.length : (json ? Object.keys(json).length : 0)
				var cnt = Math.min(mod.config.maxFetchResults, count)
				const nbPages = Math.ceil(count / cnt) + 1
				const noPage = 1
				var t = this.toLittleArray(json, cnt)

				var found = false
				if (name && t) {
					found = t.find(m => m?.id === name)
					if (found)
						t = [found]
					cnt = 1
				}

				mod.table = {
					table: t,
					noPage: noPage,
					count: count,
					cnt: cnt,
					nbPages: nbPages
				}

				// display result
				this.displayTable()
				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}

	displayTable() {
		const {
			table,
			noPage,
			count,
			cnt,
			nbPages
		} = this.ctx.components.module.huggingFace.table
		const output = this.ctx.components.output

		if (table.length > 1) {
			//this.ctx.components.event.emit(RunCommandEvent, 'c')
			output.clear()
			output.appendLine(`models founded: ${count} | page ${noPage}/${nbPages}`)
		}
		else
			output.newLine()

		const p = new Table({
			columns: [
				{ name: "id", alignment: "left", maxlen: 20 },
				{ name: "B", alignment: "left" },
				{ name: "dn", alignment: "left" },
				{ name: "lk", alignment: "left", maxLen: 1 },
				{ name: "TL", alignment: "left", maxLen: 1 },
				{ name: "TH", alignment: "left", maxLen: 1 },
				{ name: "VI", alignment: "left", maxLen: 1 },
				{ name: "AU", alignment: "left", maxLen: 1 },
				{ name: "CD", alignment: "left", maxLen: 1 },
				{ name: "tags", alignment: "left", maxLen: 30 },
			]
		});

		for (var i = 0; i < cnt; i++) {
			const r = table[i]
			p.addRow(r)
		}
		output.appendLine(p.render())
	}

	toLittleArray(json, max) {
		const t = []
		for (var i = 0; i < max; i++) {
			t.push(this.toLittleJson(json[i]))
		}
		return t
	}

	keywordsMap = {
		['instruction-following']: 'IF',	// '👨‍🏫',
		['multilingual']: 'ML', // '🌎',
		['chain-of-thought']: 'COT', //'🧠',
		['vision']: 'VI', //'👁️',
		['conversational']: 'C', //'🗣️',
		['multimodal']: 'MM',
		['reasoning']: 'R',
		['tool-calling']: 'TOOL',
		['code']: 'COD',
		['custom_code']: 'COD',
		['deep-research']: 'DR',
		['eval-results']: 'ER',
		['large-language-model']: 'LLM',
		['feature-extraction']: 'FE',

		['endpoints_compatible']: 'EC', //'🖥️',

		['text-to-speech']: 'TTS',	//'👄',
		['tts']: 'TTS',	//'👄',
		['text-generation']: 'TXG', // '📘',
		['text-generation-inference']: 'TXG',
		['image-generation']: 'IG',
		['image-text-to-text']: 'ITTT',
		['image-to-video']: 'ITV',
		['image-to-image']: 'ITI',
		['image-editing']: 'IE',
		['text-to-video']: 'TTV',
		['video-to-video']: 'VTV',
		['image-text-to-video']: 'ITTV',
		['audio-to-video']: 'ATV',
		['automatic-speech-recognition']: 'STT',
		['text-to-audio']: 'TTA',
		['video-to-audio']: 'VTA',
		['audio-to-audio']: 'ATA',
		['text-to-audio-video']: 'TTAV',
		['image-to-audio-video']: 'ITAV',
		['image-text-to-audio-video']: 'ITTAV',
		['speech-language-model']: 'SLM',

		['Dense']: '¤DS',
		['transformers']: '¤TR',
		['diffusers']: '¤DI',
		['safetensors']: '¤ST',
		['compressed-tensors']: '¤CT',
		['pytorch']: '¤PYT',
		['diffusion-single-file']: '¤DISF',
		['compressed-tensors']: '¤CT',

		['uncensored']: 'U',
		['abliterated']: 'A',
		['open-source']: 'OS'
	}

	// TL : tool , instruction following
	// TH : think / chain of thought / reasoning
	// VI : vision
	// AU : audio
	// CD : code
	// EC : end point compatible

	kwGroups = {

		'TL': [
			'IF', 'TOOL', 'ER'
		],
		'TH': [
			'COT', 'R', 'DR'
		],
		'VI': [
			'VI', 'MM', 'IG', 'ITTT', 'ITV', 'ITI', 'IE',
			'TTV', 'VTV', 'ITTV', 'ATV', 'VTA', 'TTAV',
			'ITAV', 'ITTAV'
		],
		'AU': [
			'MM', 'TTS', 'STT', 'TTA', 'VTA', 'ATA', 'TTAV',
			'ITAV', 'ITTAV', 'SLM'
		],
		'CD': [
			'COD'
		],
		'EC': [
			'EC'
		]
	}

	getKwGroups(kw) {
		const r = []
		for (const [grp, list] of Object.entries(this.kwGroups)) {
			if (list.includes(kw)) r.push(grp)
		}
		return r
	}

	toLittleJson(modelInfo) {
		var id = modelInfo.id
		var aut = ''
		const t = id.split('/')
		if (t.length > 1) {
			aut = t[0]
			id = t[1]
		}

		const tags = modelInfo.tags
			.filter(x =>
				x.length > 2
				&& !x.includes('region')
				&& !x.includes('license')
				&& !x.includes('arxiv')
				&& !x.includes('dataset')
				&& !x.includes('base_model')
				&& !x.includes('deploy')
			)
			.map(x => this.keywordsMap[x] ? this.keywordsMap[x] : x)

		var _tl = false
		var _th = false
		var _vi = false
		var _au = false
		var _cd = false

		tags.forEach(tag => {
			const grps = this.getKwGroups(tag)
			_tl |= grps.includes('TL')
			_th |= grps.includes('TH')
			_vi |= grps.includes('VI')
			_au |= grps.includes('AU')
			_cd |= grps.includes('CD')
		})

		const cm = chalk.hex('#00FF00')('x')

		return {
			id: id,
			B: null,
			dn: modelInfo.downloads,
			lk: modelInfo.likes,
			TL: _tl ? cm : ' ',
			TH: _th ? cm : ' ',
			VI: _vi ? cm : ' ',
			AU: _au ? cm : ' ',
			CD: _cd ? cm : ' ',
			tags: tags
				.join(' ')
		}
	}
}
