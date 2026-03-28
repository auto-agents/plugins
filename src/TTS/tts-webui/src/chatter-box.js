import BridgeTTSBase from "./bridge-tts-base";

export default class ChatterBoxBridge extends BridgeTTSBase {

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
            exaggeration:
                agentPars.exaggeration
                || pars.exaggeration.default,
            cfg_weight:
                agentPars.cfg_weight
                || pars.cfg_weight.default,
            temperature:
                agentPars.temperature
                || pars.temperature.default,
            device:
                agentPars.device
                || pars.device.default,
            dtype:
                agentPars.dtype
                || pars.dtype.default,
            model_name:
                agentPars.model_name
                || pars.model_name.default,
            chunked:
                agentPars.chunked
                || pars.chunked.default,
            cpu_offload:
                agentPars.cpu_offload
                || pars.cpu_offload.default,
            cache_voice:
                agentPars.cache_voice
                || pars.cache_voice.default,
            desired_length:
                agentPars.desired_length
                || pars.desired_length.default,
            max_length:
                agentPars.max_length
                || pars.max_length.default,
            halve_first_chunk:
                agentPars.halve_first_chunk
                || pars.halve_first_chunk.default,
            initial_forward_pass_backend:
                agentPars.initial_forward_pass_backend
                || pars.initial_forward_pass_backend.default,
            generate_token_backend:
                agentPars.generate_token_backend
                || pars.generate_token_backend.default,
            max_cache_len:
                agentPars.max_cache_len
                || pars.max_cache_len.default,
            max_new_tokens:
                agentPars.max_new_tokens
                || pars.max_new_tokens.default,
            audio_prompt_path: this.referenceAudioData,
            language_id:
                agentPars.language_id
                || pars.language_id.default,
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
