export default class HuggingFaceModule {

	constructor(ctx, outputContext, moduleSpec) {
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

		// include this comment as an implementation example for further devevelopment
		/*
		const stopAct = async () => {
			// TODO ...
		}

		o.newLine()
		const stopSrvAction = new ActionController(
			this.ctx,
			o,
			stopAct,
			new SpinnerService(this.ctx, o)
				.newSpinner(margin + '- stopping module <module_name>: ' + this.specification.moduleId, cliSpinners.sand)
		)
		await stopSrvAction.run()
		*/
	}
}
