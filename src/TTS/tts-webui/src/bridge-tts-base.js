import { Client } from "@gradio/client";
import { saveToTemp, toJson } from "../../../../../shared/src/utils/utils";
import SpeakerError from "../../../../../shared/src/data/speaker-error";
import { splitSentence } from "../../../../../shared/src/utils/text";
import { FifoStack, task } from "../../../../../shared/src/utils/fifo-stack";
import path from 'path'
import { existsSync, readFileSync } from 'fs'

export default class BridgeTTSBase {

    stackRunning = false
    name = null
    speakStackRunDelay = 100
    referenceAudioPath = null
    referenceAudioData = null

    /**
         * new instance
         * @param {Object} ctx context
         * @param {Object} config module config
         * @param {Object} apiConfig api config
         * @param {String} baseUrl base url
         */
    constructor(ctx, config, apiConfig, baseUrl) {
        this.ctx = ctx
        this.config = config
        this.apiConfig = apiConfig
        this.baseUrl = baseUrl
        this.name = this.config.agent.TTSApiId
        this.speakStack = new FifoStack(`${this.name} stack`, ctx, [], false)
    }

    pre_speak() {
        if (!this.stackRunning) {
            const runStack = async () => {
                await this.speakStack.processTaskes()
            }
            setTimeout(
                runStack,
                this.speakStackRunDelay)
            this.stackRunning = true
        }
    }

    getSplits(text) {
        const t = splitSentence(this.ctx, text)
        if (this.ctx.dialoger.sentenceSpliter.dumpSplitsArray)
            console.log(t)
        this.ctx.dialoger.sentenceSpliter.lastSplit = t
        return t
    }

    getPreferredVoices(preferredVoices) {
        return preferredVoices[0]
    }

    async speak(text, voice = null) {
        this.pre_speak()

        try {
            const t = this.getSplits(text)

            for (var i = 0; i < t.length; i++) {

                const tx = t[i]
                if (this.ctx.dialoger.sentenceSpliter.dumpSplits)
                    console.log(tx)

                const cnf = this.apiConfig.paths.speak
                const pars = cnf.parameters
                const agentPars = this.config.agent.speak.config

                const client = await Client.connect(this.baseUrl)

                const result = await client.predict(
                    cnf.uri,
                    this.getSpeakParameters(tx, agentPars, pars, voice)
                ).catch(err0 => {
                    throw SpeakerError.fromErr('speak fail', err0)
                })

                saveToTemp(this.ctx, 'tts.json', toJson(result))
                const filepath = result.data[0].path

                this.speakStack.addTask(
                    task(
                        `${this.name}: speak`,
                        async () => await this.config.playSoundFunc(filepath)
                    ))
            }
        } catch (err) {
            throw SpeakerError.fromErr('speak fail', err)
        }
    }

    findReferenceAudioFile(referenceAudio) {
        // scan configured paths to find audio file
        const basePath = this.config.paths.basePath
        var res = null
        this.config.paths.voices.forEach(p => {
            if (!res) {
                if (!path.isAbsolute(p))
                    p = path.join(basePath, p)

                if (this.config.dumpSearchReferenceAudio)
                    console.log('search ref audio in: ' + p)

                const fp = path.join(p, referenceAudio)
                // scan the path for file
                res = existsSync(fp) ? fp : null
            }
        })
        return res
    }

    loadReferenceAudioData(referenceAudio) {
        if (this.referenceAudioPath == referenceAudio
            && this.referenceAudioData
        ) return

        this.getReferenceAudio(referenceAudio)
        referenceAudio = this.referenceAudioPath

        if (this.config.dumpImportReferenceAudio)
            console.log('import reference audio file: ' + referenceAudio)

        const d = readFileSync(referenceAudio)
        const b = new Blob(d)

        this.referenceAudioData = b
    }

    getReferenceAudio(referenceAudio) {
        if (this.referenceAudioPath == referenceAudio
            && this.referenceAudioData
        ) return

        this.referenceAudioPath = referenceAudio
        this.referenceAudioData = null

        if (!path.isAbsolute(referenceAudio))
            referenceAudio = this.findReferenceAudioFile(referenceAudio)
        if (!referenceAudio) throw SpeakerError.fromMessage('reference audio file not found: ' + referenceAudio)

        this.referenceAudioPath = referenceAudio
    }
}