import BridgeTTSBase from "./bridge-tts-base";

export default class OpenVoiceV2Bridge extends BridgeTTSBase {

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
        super.loadReferenceAudioData(
            this.getPreferredVoices(
                this.config.agent.speak.preferredVoices)
            || pars.voice.default,
        )

        return {
            text: tx,
            speaker_accent:
                agentPars.speaker_accent
                || pars.speaker_accent.default,
            reference_audio: this.referenceAudioData,
            language_code: agentPars.language_code
                || pars.language_code.default,
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
