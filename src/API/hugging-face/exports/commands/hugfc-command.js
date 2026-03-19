import path from 'path'
import { spawn } from 'child_process'

import Command from '../../../../../../shared/src/commands/command.js'
import { renderMd } from '../../../../../../shared/src/utils/decorators.js'
import { Table } from 'console-table-printer'
import chalk from 'chalk'
import { CommandKeyboardCaptureReleaseEvent, KeyboardCaptureRequestEvent, RunCommandEvent } from '../../../../../../shared/src/data/events.js'
import wildcard from 'wildcard'

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

				const argSort = 'sort'
				const optSort = this.getValue(com, args, argSort)
				if (!this.checkParameter(com, argSort, optSort)) return

				const argDir = 'dir'
				const optDir = this.getValue(com, args, argDir)
				if (!this.checkParameter(com, argDir, optDir)) return

				const argFilter = 'filter'
				const optFilter = this.getValue(com, args, argFilter) || ''
				if (!this.checkParameter(com, argFilter, optFilter)) return
				const hasFilter = optFilter.length > 0

				if (hasFilter && !name) {
					this.emitCommandError('name is required when using option filter')
					return
				}

				const options = {
					sort: {
						field: optSort,
						dir: optDir,
					},
					filter: optFilter,
					name: name
				}

				this.setTable(json, options)

				if (name && !hasFilter) {
					const found = mod.models.find(m => m?.id === name)
					if (found) {
						mod.models = [found]
					}
				}

				const noPage = 1
				this.setPage(noPage, options)

				// display result
				this.displayTable()
				break

			default:
				this.emitCommandError(`Unknown action: ${action} `)
		}
	}

	setTable(json, options) {
		const mod = this.ctx.components.module.huggingFace
		mod.json = json
		const count = json.length
		var cnt = Math.min(mod.config.pageSize, count)
		const nbPages = Math.ceil(count / cnt) + 1

		var t = this.toLittleArray(json, 0, count)

		// filter

		if (options.filter.length > 0) {
			const t2 = []
			for (var i = 0; i < t.length; i++) {
				const r = t[i]
				const v = r[options.filter]
				if (wildcard(options.name, v))
					t2.push(r)
			}
			t = t2
		}

		// sort

		const inv = (options.sort.dir == 'desc') ? -1 : 1
		switch (options.sort?.field) {

			case 'id':
				t.sort((a, b) => {
					const nameA = a.id.toLowerCase();
					const nameB = b.id.toLowerCase();
					if (nameA < nameB) {
						return -1 * inv;
					}
					if (nameA > nameB) {
						return 1 * inv;
					}
					return 0;
				})
				break

			case 'B':
				t.sort((a, b) => (a.B - b.B) * inv)
				break
			case 'dn':
				t.sort((a, b) => (a.dn - b.dn) * inv)
				break
			case 'lk':
				t.sort((a, b) => (a.lk - b.lk) * inv)
				break
			case 'TL':
				t.sort((a, b) => ((a.TL ? 1 : 0) - (b.TL ? 1 : 0)) * inv)
				break
			case 'TH':
				t.sort((a, b) => ((a.TH ? 1 : 0) - (b.TH ? 1 : 0)) * inv)
				break
			case 'VI':
				t.sort((a, b) => ((a.VI ? 1 : 0) - (b.VI ? 1 : 0)) * inv)
				break
			case 'AU':
				t.sort((a, b) => ((a.AU ? 1 : 0) - (b.AU ? 1 : 0)) * inv)
				break
			case 'CD':
				t.sort((a, b) => ((a.CD ? 1 : 0) - (b.CD ? 1 : 0)) * inv)
				break

		}
		mod.models = t
	}

	setPage(noPage, options) {
		const mod = this.ctx.components.module.huggingFace
		const t = mod.models
		const count = t.length
		var cnt = Math.min(mod.config.pageSize, count)
		const nbPages = Math.floor(count / cnt)

		const i = (noPage - 1) * mod.config.pageSize
		const j = (noPage - 1) * mod.config.pageSize + cnt

		mod.table = {
			table: t.slice(i, j),
			noPage: noPage,
			count: count,
			cnt: cnt,
			nbPages: nbPages,
			options: options,
			selectedIndex: 0
		}
	}

	displayTable() {
		const mod = this.ctx.components.module.huggingFace
		const {
			table,
			noPage,
			count,
			cnt,
			nbPages,
			options,
			selectedIndex
		} = mod.table
		const o = this.ctx.components.output
		const e = this.ctx.components.event

		if (table.length > 1) {
			e.emit(KeyboardCaptureRequestEvent, this)
			o.clear()
			o.appendLine(`models founded: ${count} | page ${noPage}/${nbPages} ${mod.config.kbdHelp}`)
		}
		else
			o.newLine()

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

		var selectedRow = null
		var selectedModelFullId = null

		for (var i = 0; i < cnt; i++) {
			var r = table[i]
			if (i == selectedIndex) {
				const r2 = {}
				for (var [f, v] of Object.entries(r)) {
					if (f != 'originalId') {
						const tx = String(v === null ? ' ' : v)
						const ta = tx.split(' ')
						v = ta.map(x => chalk.hex(mod.config.theme.selectedItem.foreground)(x))
							.join(' ')
						r2[f] = v
					}
				}
				selectedModelFullId = r.originalId
				selectedRow = r
				r = r2
			} else r = { ...r }
			delete r.originalId
			p.addRow(r)
		}

		const cardUrl = mod.config.urls.cardBaseUrl + selectedModelFullId

		o.appendLine(p.render())
		o.newLine()
		o.appendLine(
			chalk.hex(mod.config.theme.hgCol)('model: ')
			+ chalk.hex(mod.config.theme.selectedItem.foreground)(selectedModelFullId))
		o.appendLine(
			(chalk.hex(mod.config.theme.hgCol)('card url: '))
			+ cardUrl)
		o.newLine()
		o.appendLine(chalk.hex(mod.config.theme.cmtCol)(mod.config.legend))
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
			this.setPage(table.noPage, table.options)
			this.displayTable()
		}

		if (k.leftArrow) {
			table.noPage--
			if (table.noPage < 1)
				table.noPage = table.nbPages
			this.setPage(table.noPage, table.options)
			this.displayTable()
		}

		if (k.downArrow) {
			mod.table.selectedIndex = Math.min(
				mod.table.cnt - 1,
				mod.table.selectedIndex + 1
			)
			this.displayTable()
		}

		if (k.upArrow) {
			mod.table.selectedIndex = Math.max(
				0,
				mod.table.selectedIndex - 1
			)
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
		['code']: 'CD',
		['coder']: 'COD',
		['coding']: 'COD',
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
		['image-classification']: 'IMGCL',
		['speech-language-model']: 'SLM',
		['audio']: 'AU',
		['audio-classification']: 'AU',
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
			'IF', 'TOOL', 'INSTR'
		],
		'TH': [
			'COT', 'R', 'DR', 'PROB', 'INSTR'
		],
		'VI': [
			'VI', 'MM', 'IG', 'ITTT', 'ITV', 'ITI', 'IE',
			'TTV', 'VTV', 'ITTV', 'ATV', 'VTA', 'TTAV',
			'ITAV', 'ITTAV', 'IMGCL'
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

	transformId(id) {
		var aut = ''
		const t = id.split('/')
		if (t.length > 1) {
			aut = t[0]
			id = t[1]
		}
		return id
	}

	toLittleJson(idx, modelInfo) {
		const mod = this.ctx.components.module.huggingFace
		const originalId = modelInfo.id
		var id = modelInfo.id
		id = this.transformId(id)

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

		const idt = id.split('-')
		var b = null
		for (var i = 0; i < idt.length; i++) {
			if (b === null) {
				const seg = idt[i]
				if (seg[seg.length - 1] == 'B') {
					b = seg.slice(0, seg.length - 1)
				}
			}
		}

		const cm = mod.config.theme.checkmark
		const nv = null
		const idMaxLen = mod.config.layout.idMaxLen
		if (id.length > idMaxLen)
			id = id.substr(0, idMaxLen) + '...'
		return {
			idx: idx,
			id: id,
			B: b,
			dn: modelInfo.downloads,
			lk: modelInfo.likes,
			TL: _tl ? cm : nv,
			TH: _th ? cm : nv,
			VI: _vi ? cm : nv,
			AU: _au ? cm : nv,
			CD: _cd ? cm : nv,
			tags: tags
				.join(' '),
			originalId: originalId
		}
	}
}
