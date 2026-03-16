export default class HuggingFaceModule {

	constructor(ctx, config, outputContext, moduleSpec) {
		this.config = config
		this.specification = moduleSpec
		this.ctx = ctx
		this.outputContext = outputContext
	}

	/**
	 * module init
	 */
	async init() {
		this.ctx.components.module.huggingFace = this
	}

	/**
	 * unload module
	 * @param {Object} outputContext
	 */
	async unload(outputContext) {
		const oc = outputContext || this.outputContext
		const o = oc.output
		const margin = ' '.repeat(oc.margin + oc.marginBase)

		this.ctx.components.module.huggingFace = null
		o.newLine()
		o.appendLine(margin + '- module unloaded: ' + this.specification.moduleId)
	}
}
