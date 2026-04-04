import path from "node:path"
import SpinnerService from "../../../cli/src/services/spinner-service"
import Status from "../../../shared/src/utils/status"
import { splitSentence } from "../../../shared/src/utils/text/text"
import { existsSync } from "fs";

export default class TTSPluginBase {

    speakPreProcessors = []

    constructor(ctx, config, outputContext, pluginSpec, overloadConfig = null, desc) {
        this.desc = desc
        this.specification = pluginSpec
        this.ctx = ctx
        this.status = new Status(ctx)
        this.config = config
        if (overloadConfig != null)
            this.config = {
                ...this.config,
                ...overloadConfig
            }
        this.outputContext = outputContext
        this.spinner = new SpinnerService(ctx, outputContext.output)
        this.#loadSpeakPreProcessors()
    }

    #loadSpeakPreProcessors() {
        if (!this.config.agent.speak.config)
            this.config.agent.speak.config = {}
        if (!this.config.agent.speak.config.preProcessors) {
            this.config.agent.speak.config.preProcessors = []
        }
        this.config.agent.speak.config.preProcessors =
            [
                ...this.config.agent.speak.config.preProcessors,
                ...this.ctx.dialoger.speakPreProcessors
            ]
        const bp = path.join(
            process.cwd(),
            this.ctx.paths.speakPreProcessors
        )
        const pps = this.config.agent.speak.config.preProcessors
        for (var i = 0; i < pps.length; i++) {
            const p = pps[i]
            const mpath = path.join(bp, p)
            if (!existsSync(mpath))
                throw new Error('speak pre processor not found: ' + mpath)
            const m = require(mpath)
            const o = new m.default(this.ctx)
            this.speakPreProcessors.push(o)
        }
    }

    getSplits(text) {
        const t = splitSentence(this.ctx, text)
        if (this.ctx.dialoger.sentenceSpliter.dumpSplitsArray)
            console.log(t)
        this.ctx.dialoger.sentenceSpliter.lastSplit = t
        return t
    }

    runPreProcessors(text) {
        this.speakPreProcessors.forEach(p => {
            text = p.run(text)
        })
        return text
    }
}