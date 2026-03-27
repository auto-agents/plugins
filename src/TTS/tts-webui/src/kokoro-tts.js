import { Client } from "@gradio/client";
import { saveToTemp, toJson } from "../../../../../shared/src/utils/utils";
import SpeakerError from "../../../../../shared/src/data/speaker-error";
import { splitSentence } from "../../../../../shared/src/utils/text";
import { FifoStack, task } from "../../../../../shared/src/utils/fifo-stack";

export default class KokoroTTSBridge {

    stackRunning = false

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
        this.speakStack = new FifoStack('kokoro tts stack', ctx, [], false)
    }

    /* ---- TTS module interface impl ---- */

    async speak(text, voice = null) {

        if (!this.stackRunning) {
            const runStack = async () => {
                await this.speakStack.processTaskes()
            }
            setTimeout(
                runStack,
                100)
            this.stackRunning = true
        }

        try {
            const t = splitSentence(this.ctx, text)
            if (this.ctx.dialoger.sentenceSpliter.dumpSplitsArray)
                console.log(t)
            this.ctx.dialoger.sentenceSpliter.lastSplit = t

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
                    {
                        text: tx,
                        voice:
                            this.getPreferredVoices(
                                this.config.agent.speak.preferredVoices)
                            || pars.voice.default,
                        speed:
                            agentPars.speed
                            || pars.speed.default,
                        use_gpu:
                            agentPars.use_gpu
                            || pars.use_gpu.default,
                        model_name:
                            agentPars.model_name
                            || pars.model_name.default,
                        seed:
                            agentPars.seed
                            || pars.seed.default,
                    });
                saveToTemp(this.ctx, 'tts.json', toJson(result))
                const filepath = result.data[0].path

                this.speakStack.addTask(
                    task(
                        'kokoro-tts: speak',
                        async () => await this.config.playSoundFunc(filepath)
                    ))
            }
        } catch (err) {
            throw SpeakerError.fromErr('speak fail', err)
        }
    }

    async waitIdle(timeout) {
    }

    async shetUp() {
    }

    getPreferredVoices(preferredVoices) {
        return preferredVoices[0]
    }

    /* <---- ---- */
}
