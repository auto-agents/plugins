import BridgeTTSBase from "./bridge-tts-base";

export default class OpenVoiceV1Bridge extends BridgeTTSBase {

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
        super.loadReferenceAudioData(
            this.getPreferredVoices(
                this.config.agent.speak.preferredVoices)
            || pars.voice.default,
        )

        return {
            text: tx,
            style:
                agentPars.style
                || pars.style.default,
            reference_audio: this.referenceAudioData,
            seed:
                agentPars.seed
                || pars.seed.default
        };
    }

    async waitIdle(timeout) {
    }

    async shetUp() {
    }

    /* <---- ---- */
}
