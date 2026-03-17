import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../shared/src/commands/command.js'
import { renderMd } from '../../../../shared/src/utils/decorators.js'
import { Table } from 'console-table-printer'
import chalk from 'chalk'
import { CommandKeyboardCaptureReleaseEvent, KeyboardCaptureRequestEvent, RunCommandEvent } from '../../../../shared/src/data/events.js'

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
				const noPage = 1

				const options = {
					sort: {
						field: 'id', dir: 'up'
					}
				}
				this.setPage(noPage, options)

				if (name) {
					const found = mod.table.table.find(m => m?.id === name)
					if (found) {
						mod.table.table = [found]
						mod.table.cnt = 1
					}
				}

				// display result
				this.displayTable()
				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}

	setPage(noPage, options) {
		const mod = this.ctx.components.module.huggingFace
		const json = mod.models
		const count = Array.isArray(json) ? json.length : (json ? Object.keys(json).length : 0)
		var cnt = Math.min(mod.config.pageSize, count)
		const nbPages = Math.ceil(count / cnt) + 1
		var t = this.toLittleArray(json, (noPage - 1) * mod.config.pageSize, cnt)
		mod.table = {
			table: t,
			noPage: noPage,
			count: count,
			cnt: cnt,
			nbPages: nbPages,
			options: options
		}
	}

	displayTable() {
		const mod = this.ctx.components.module.huggingFace
		const {
			table,
			noPage,
			count,
			cnt,
			nbPages
		} = mod.table
		const output = this.ctx.components.output
		const e = this.ctx.components.event

		if (table.length > 1) {
			e.emit(KeyboardCaptureRequestEvent, this)
			output.clear()
			output.appendLine(`models founded: ${count} | page ${noPage}/${nbPages} ${mod.config.kbdHelp}`)
		}
		else
			output.newLine()

		const p = new Table({
			columns: [
				{ name: 'idx', alignment: 'left' },
				{ name: "id", alignment: "left", maxlen: mod.config.layout.idMaxLen },
				{ name: "B", alignment: "left" },
				{ name: "dn", alignment: "left" },
				{ name: "lk", alignment: "left", maxLen: 1 },
				{ name: "TL", alignment: "left", maxLen: 1 },
				{ name: "TH", alignment: "left", maxLen: 1 },
				{ name: "VI", alignment: "left", maxLen: 1 },
				{ name: "AU", alignment: "left", maxLen: 1 },
				{ name: "CD", alignment: "left", maxLen: 1 },
				{ name: "tags", alignment: "left", maxLen: mod.config.layout.tagsMaxLen },
			]
		});

		for (var i = 0; i < cnt; i++) {
			const r = table[i]
			p.addRow(r)
		}
		output.appendLine(p.render())
		output.appendLine(mod.config.legend)
	}

	onKeyboardEvent(k) {
		const mod = this.ctx.components.module.huggingFace
		const table = mod.table
		const e = this.ctx.components.event
		const o = this.ctx.components.output

		if (k == mod.config.keys.close) {
			e.emit(CommandKeyboardCaptureReleaseEvent, this)
			o.newLine()
			o.appendLine('table closed')
			return
		}

		if (k.rightArrow) {
			table.noPage++
			if (table.noPage > table.nbPages)
				table.noPage = 1
			this.setPage(table.noPage)
			this.displayTable()
		}

		if (k.leftArrow) {
			table.noPage--
			if (table.noPage < 1)
				table.noPage = table.nbPages
			this.setPage(table.noPage)
			this.displayTable()
		}
	}

	toLittleArray(json, start, count) {
		const t = []
		for (var i = 0; i < count; i++) {
			const j = i + start
			if (j < json.length)
				t.push(this.toLittleJson(j, json[j]))
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
		['instruct']: 'INSTR',
		['code']: 'COD',
		['custom_code']: 'COD',
		['deep-research']: 'DR',
		['eval-results']: 'ER',
		['large-language-model']: 'LLM',
		['feature-extraction']: 'FE',
		['storytelling']: 'STORY',
		['story']: 'STORY',
		['text-embeddings-inference']: 'EMB',
		['problem-solving']: 'PROB',

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
		['text-to-image']: 'TTI',
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
		['audio']: 'AU',
		['pyannote-audio-pipeline']: 'AU',
		['pyannote-audio']: 'AU',
		['pyannote']: 'AU',
		['voice']: 'VOI',
		['speech']: 'VOI',
		['speaker-diarization']: 'SPKR',
		['speaker-change-detection']: 'CSPKR',
		['voice-activity-detection']: 'ASPKR',
		['overlapped-speech-detection']: 'OSPKR',

		['Dense']: '¤DS',
		['transformers']: '¤TR',
		['diffusers']: '¤DI',
		['safetensors']: '¤ST',
		['compressed-tensors']: '¤CT',
		['pytorch']: '¤PYT',
		['diffusion-single-file']: '¤DISF',
		['compressed-tensors']: '¤CT',
		['sentence-transformers']: 'STR',
		['sentence-similarity']: 'STSI',
		['science-reasoning']: 'SCIE',
		['science']: 'SCIE',
		['cardiovascular']: 'MEDIC',
		['medical']: 'MEDIC',
		['medicine']: 'MEDIC',
		['medical-understanding']: 'MEDIC',
		['medical-reasoning']: 'MEDIC',
		['medical-diagnosis']: 'MEDIC',
		['medical-diagnosis']: 'MEDIC',
		['medical-management']: 'MEDIC',
		['internal-medecine']: 'MEDIC',

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
			'IF', 'TOOL', 'ER', 'INSTR'
		],
		'TH': [
			'COT', 'R', 'DR', 'PROB', 'INSTR'
		],
		'VI': [
			'VI', 'MM', 'IG', 'ITTT', 'ITV', 'ITI', 'IE',
			'TTV', 'VTV', 'ITTV', 'ATV', 'VTA', 'TTAV',
			'ITAV', 'ITTAV'
		],
		'AU': [
			'MM', 'TTS', 'STT', 'TTA', 'VTA', 'ATA', 'TTAV',
			'ITAV', 'ITTAV', 'SLM', 'AU', 'VOI', 'SPKR',
			'CSPKR', 'ASPKR', 'OSPKR'
		],
		'CD': [
			'COD'
		],
		'EC': [
			'EC'
		]
	}

	ignoreTags = [
		'region',
		'license',
		'arxiv',
		'dataset',
		'base_model',
		'deploy',
		'context',
		'creative',
		'writing',
		'fiction',
		'generation',
		'scene',
		'continue',
		'all',
		'genres',
		'romance',
		'prosing',
		'vivid',
		'roleplaying',
		'swearing',
		'horror',
		'mergekit',
		'plot',
		'sub-plot',
		'mixture',
		'of',
		'experts'
	]

	getKwGroups(kw) {
		const r = []
		for (const [grp, list] of Object.entries(this.kwGroups)) {
			if (list.includes(kw)) r.push(grp)
		}
		return r
	}

	toLittleJson(idx, modelInfo) {
		const mod = this.ctx.components.module.huggingFace
		var id = modelInfo.id
		var aut = ''
		const t = id.split('/')
		if (t.length > 1) {
			aut = t[0]
			id = t[1]
		}

		const tagNotPartOfIgnoredOne = x => {
			var r = true
			this.ignoreTags.forEach(t => r &= !x.includes(t))
			return r
		}

		const tags = modelInfo.tags
			.filter(x =>
				x.length >= mod.config.minTagSize
				&& tagNotPartOfIgnoredOne(x)
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

		const cm = mod.config.theme.checkmark
		const idMaxLen = mod.config.layout.idMaxLen
		if (id.length > idMaxLen)
			id = id.substr(0, idMaxLen) + '...'
		return {
			idx: idx,
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
