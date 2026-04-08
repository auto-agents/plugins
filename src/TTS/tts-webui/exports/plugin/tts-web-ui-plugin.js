import { existsSync } from "fs";
import { join, dirname } from 'path';
import { toJson } from "../../../../../../shared/src/utils/utils";
import SpeakerError from "../../../../../../shared/src/data/speaker-error";
import { CommandRunErrorEvent } from "../../../../../../shared/src/data/events";
import { spawn } from 'child_process'
import TTSPluginBase from "../../../tts-plugin-base";

export default class TTSWebUI extends TTSPluginBase {

	constructor(ctx, config, outputContext, pluginSpec, overloadConfig = null) {
		super(ctx, config, outputContext, pluginSpec, overloadConfig, 'TTS-WebUI plugin')

		this.apiId = this.config.agent?.speak?.config?.api

		const util = require('node:util');
		this.exec = util.promisify(require('node:child_process').exec);
	}

	/**
	 * plugin init
	 */
	async init() {

		try {
			const o = this.outputContext.output
			const margin = ' '.repeat(this.outputContext.margin + this.outputContext.marginBase)
			const margin2 = ' '.repeat(margin.length + this.outputContext.marginBase)
			const apiId = this.apiId
			this.config.agent.TTSApiId = apiId

			//o.appendLine(toJson(this.config.agent.speak))

			o.newLine()
			o.appendLine(margin + `~ loading ${this.desc} API bridge for: "${apiId}"`)

			if (!apiId)
				throw new Error('api is not defined')
			const apiConfig = this.specification.config.apis[apiId]
			if (!apiConfig)
				throw new Error('api not found: ' + apiId)
			const apiBridgeFilename = apiConfig.bridgeFile
			if (!apiBridgeFilename)
				throw new Error('api bridge file not defined')

			const apiBridgePath = join(
				dirname(this.specification.file),
				'..',
				'..',
				'src',
				apiBridgeFilename
			)
			this.config.agent.TTSWebUIAPIBridgeName = apiBridgeFilename

			// load bridge

			o.appendLine(margin2 + `- setup API bridge ${apiBridgePath}`)

			if (!existsSync(apiBridgePath))
				throw new Error('bridge file not found')

			const bridge = require(apiBridgePath)
			try {
				this.apiBridge = new bridge.default(
					this.ctx,
					this.config,
					apiConfig,
					this.config.baseUrl.replace('{port}', this.config.port)
				)
				this.config.agent.apiBridge = this.apiBridge
				o.appendLine(margin2 + `  api bridge loaded ✔`)

				// TODO: load play sound mobile from config
				this.config.playSoundFunc =
					async (f) => await this.playSoundWithShell(f)
			}
			catch (err) {
				throw err
			}
		} catch (err0) {
			throw SpeakerError.fromErr('load fail', err0)
		}
	}

	// TODO: in config + a plugin or a component
	async playSoundWithShell(filepath) {
		var tool = this.ctx.shell.playSound[
			this.ctx.shell.platform
		]
		if (!tool) throw SpeakerError.fromMessage('shell sound player not available')

		filepath = filepath.replaceAll('"', '\\"')
		tool = tool.replace('{filePath}', filepath)
		//tool = tool.replaceAll('\\', "\\\\")

		await (this.exec(tool))	// wait exec

		/*const player = spawn(
			tool,
			{
				shell: true,
				stdio: 'inherit',
				detached: true
			})

		player.on('error', (error) => {
			console.error(error)
			//throw new Error(error)
		})*/

		/*player.on('spawn', () => {
			console.log('spawn')
		})*/

		//player.unref()	// use to unwait
	}

	/**
	 * unload plugin
	 * @param {Object} outputContext
	 */
	async unload(outputContext) {
		const { oc, o, margin } = this.#getOutput(outputContext)
	}

	/* ---- TTS plugin interface impl ---- */
	/* ---- rely on the API bridge ---- */

	async speak(text, voice = null) {
		this.#assertSpeakPluginImplAvailable()
		//console.log(`[TTS:${this.apiId}]`)
		return await this.apiBridge.speak(text, voice)
	}

	async waitIdle(timeout) {
		this.#assertSpeakPluginImplAvailable()
	}

	async shetUp() {
		this.#assertSpeakPluginImplAvailable()
		try {
			await this.apiBridge.shetUp()
		} catch (err) {
			throw SpeakerError.fromErr('shet up fail', err)
		}
	}

	getPreferredVoices(preferredVoices) {
	}

	/* <---- ---- */

	#assertSpeakPluginImplAvailable() {
		if (!this.config.agent.apiBridge) throw new SpeakerError('TTS plugin bridge implementation not available (null)')
	}

	#getOutput(outputContext) {
		const oc = outputContext || this.outputContext
		return {
			oc: oc,
			o: oc.output,
			margin: ' '.repeat(oc.margin + oc.marginBase)
		}
	}
}
