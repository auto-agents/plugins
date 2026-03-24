export default function config() {
	return {
		modules: {
			TTSWebUI: {
				moduleId: 'TTSWebUI',
				description: 'module for Gradio + React WebUI with extensions for ACE-Step, Kimi Audio, Piper TTS, GPT-SoVITS, CosyVoice, XTTSv2, DIA, Kokoro, OpenVoice, ParlerTTS, Stable Audio, MMS, StyleTTS2, MAGNet, AudioGen, MusicGen, Tortoise, RVC, Vocos, Demucs, SeamlessM4T, and Bark!',
				file: 'tts-web-ui.js',
				category: 'TTS',

				autoLoad: false,
				internal: true,
				enabled: false,
				isLoaded: false,

				config: {
					baseUrl: 'http://127.0.0.1:{port}',
					port: 7770,
					apis: {
						kokoroTTS: {
							bridgeFile: 'kokoro-tts.js',
							description: '',
							paths: {
								speak: {
									uri: '/kokoro',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										voice: {
											default: 'af_heart',
											description: 'The input value that is provided in the "Voice" Dropdown component.'
										},
										speed: {
											sample: 1,
											description: 'The input value that is provided in the "Speed" Slider component.'
										},
										use_gpu: {
											sample: 'true',
											description: 'The input value that is provided in the "Hardware" Dropdown component.'
										},
										model_name: {
											sample: 'hexgrad/Kokoro-82M',
											description: 'The input value that is provided in the "Model" Dropdown component.'
										},
										seed: {
											default: '-1',
											description: 'The input value that is provided in the "parameter_482" Textbox component.'
										}
									},
									return: {
										/*'[0]': 'The output value that appears in the "Generated Audio" Audio component.',
										'[1]': 'The output value that appears in the "value_492" Textbox component.',
										'[2]': 'The output value that appears in the "value_500" Json component.',
										'[3]': 'The output value that appears in the "value_501" Textbox component.',*/
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
