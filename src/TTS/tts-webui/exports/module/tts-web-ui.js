//import cliSpinners from 'cli-spinners';
import { existsSync } from "fs";
import { join, dirname } from 'path';
import { toJson } from "../../../../../../shared/src/utils/utils";
import SpeakerError from "../../../../../../shared/src/data/speaker-error";
/*import ActionController from "../controllers/action-controller.js";
import SpinnerService from "../services/spinner-service.js";
import Status from '../../../shared/src/utils/status.js'
import utils, { addServer, removeServer, toJson } from '../../../shared/src/utils/utils.js'
import Server from '../../../shared/src/data/server.js';
import SpeakerError from '../../../shared/src/data/speaker-error.js';
*/
export default class TTSWebUI {

	desc = 'TTS-WebUI module'

	constructor(ctx, config, outputContext, moduleSpec, overloadConfig = null) {
		this.config = config
		if (overloadConfig != null)
			this.config = {
				...this.config,
				...overloadConfig
			}
		this.specification = moduleSpec
		this.ctx = ctx
		this.outputContext = outputContext
		this.apiId = this.config.agent?.speak?.config?.api
	}

	/**
	 * module init
	 */
	async init() {

		try {
			const o = this.outputContext.output
			const margin = ' '.repeat(this.outputContext.margin + this.outputContext.marginBase)
			const margin2 = ' '.repeat(margin.length + this.outputContext.marginBase)
			const apiId = this.apiId

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
				apiBridge = new bridge.default({
					ctx: this.ctx,
					config: this.config,
					apiConfig: apiConfig,
					baseUrl: this.config.baseUrl.replace('{port}', this.config.port)
				})
				this.config.agent.apiBridge = apiBridge
				o.appendLine(margin2 + `  api bridge loaded ✔`)
			}
			catch (err) {
				throw err
			}
		} catch (err0) {
			throw SpeakerError.fromErr('load fail', err0)
		}
	}

	/**
	 * unload module
	 * @param {Object} outputContext
	 */
	async unload(outputContext) {
		const { oc, o, margin } = this.#getOutput(outputContext)
	}

	/* ---- TTS module interface impl ---- */
	/* ---- rely on the API bridge ---- */

	async speak(text, voice = null) {
		this.#assertSpeakModuleImplAvailable()
	}

	async waitIdle(timeout) {
		this.#assertSpeakModuleImplAvailable()
	}

	async shetUp() {
		this.#assertSpeakModuleImplAvailable()
	}

	getPreferredVoices(preferredVoices) {
	}

	/* <---- ---- */

	#assertSpeakModuleImplAvailable() {
		if (!this.config.agent.apiBridge) throw new SpeakerError('TTS module bridge implementation not available (null)')
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
