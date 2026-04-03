import BridgeTTSBase from "./bridge-tts-base";

export default class KokoroTTSBridge extends BridgeTTSBase {

    /**
     * new instance
     * @param {Object} ctx context
     * @param {Object} config plugin config
     * @param {Object} apiConfig api config
     * @param {String} baseUrl base url
     */
    constructor(ctx, config, apiConfig, baseUrl) {
        super(ctx, config, apiConfig, baseUrl)
    }

    /* ---- TTS plugin interface impl ---- */

    async speak(text, voice = null) {
        await super.speak(text, voice)
    }

    getSpeakParameters(tx, agentPars, pars, voice) {
        return {
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
        };
    }

    async waitIdle(timeout) {
    }

    async shetUp() {
    }

    /* <---- ---- */
}
