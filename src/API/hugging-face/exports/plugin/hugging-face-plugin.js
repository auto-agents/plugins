export default class HuggingFacePlugin {

	constructor(ctx, config, outputContext, pluginSpec) {
		this.config = config
		this.specification = pluginSpec
		this.ctx = ctx
		this.outputContext = outputContext
	}

	/**
	 * plugin init
	 */
	async init() {
		this.ctx.components.plugin.huggingFace = this
	}

	/**
	 * unload plugin
	 * @param {Object} outputContext
	 */
	async unload(outputContext) {
		const oc = outputContext || this.outputContext
		const o = oc.output
		const margin = ' '.repeat(oc.margin + oc.marginBase)

		this.ctx.components.plugin.huggingFace = null
	}
}
