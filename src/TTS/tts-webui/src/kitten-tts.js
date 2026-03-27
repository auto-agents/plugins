import BridgeTTSBase from "./bridge-tts-base";

export default class KittenTTSBridge extends BridgeTTSBase {

    /**
     * new instance
     * @param {Object} ctx context
     * @param {Object} config module config
     * @param {Object} apiConfig api config
     * @param {String} baseUrl base url
     */
    constructor(ctx, config, apiConfig, baseUrl) {
        super(ctx, config, apiConfig, baseUrl)
    }

    /* ---- TTS module interface impl ---- */

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
            model_name:
                agentPars.model_name
                || pars.model_name.default
        };
    }

    async waitIdle(timeout) {
    }

    async shetUp() {
    }

    /* <---- ---- */
}
