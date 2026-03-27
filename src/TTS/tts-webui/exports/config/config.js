export default function config() {
	return {
		modules: {
			TTSWebUI: {
				moduleId: 'TTSWebUI',
				description: 'module for Gradio + React WebUI with extensions for ACE-Step, Kimi Audio, Piper TTS, GPT-SoVITS, CosyVoice, XTTSv2, DIA, Kokoro, OpenVoice, ParlerTTS, Stable Audio, MMS, StyleTTS2, MAGNet, AudioGen, MusicGen, Tortoise, RVC, Vocos, Demucs, SeamlessM4T, and Bark!',
				file: 'tts-web-ui-module.js',
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
											possibleValues: [

											],
											description: 'The input value that is provided in the "Voice" Dropdown component.'
										},
										speed: {
											default: 1,
											description: 'The input value that is provided in the "Speed" Slider component.'
										},
										use_gpu: {
											default: true,
											description: 'The input value that is provided in the "Hardware" Dropdown component.'
										},
										model_name: {
											default: 'hexgrad/Kokoro-82M',
											possibleValues: [

											],
											description: 'The input value that is provided in the "Model" Dropdown component.'
										},
										seed: {
											default: 2044339735,
											description: 'The input value that is provided in the "parameter_482" Textbox component.'
										}
									},
									return: {
										['data[0]']: {
											path: 'wav path in user gradio temp folder (eg. AppData\\Local\\Temp\\gradio\\)',
											url: 'url to gradio file url',
											size: 'wav size or null',
											mime_type: 'mime type or null',
											is_stream: 'true or false'
										},
										['data[1]']: "Phonetics tokens eg: tˈAk kˈɛɹ, ænd ɹəmˈɛmbəɹ",
										['data[2]']: 'query payload',
										['data[3]']: 'the tts web ui outputs folder for the generation (includes all files in various formats and metadata)',
									}
								},
								unloadModel: {
									uri: '/kokoro_unload_model',
									parameters: {
										model_name: {
											default: 'hexgrad/Kokoro-82M',
											description: 'The input value that is provided in the "Model" Dropdown component.'
										}
									},
									return: {
									}
								}
							}
						},

						kittenTTS: {
							bridgeFile: 'kitten-tts.js',
							description: '',
							paths: {
								speak: {
									uri: '/kitten_tts',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										voice: {
											default: 'expr-voice-2-f',
											possibleValues:
												[
													'expr-voice-2-f',
													'expr-voice-2-m',
													'expr-voice-3-m',
													'expr-voice-3-f',
													'expr-voice-4-m',
													'expr-voice-4-f',
													'expr-voice-5-m',
													'expr-voice-5-f']
											,
											description: 'The input value that is provided in the "Voice" Dropdown component.'
										},
										model_name: {
											default: 'KittenML/kitten-tts-mini-0.1',
											possibleValues: [
												'KittenML/kitten-tts-mini-0.1',
												'KittenML/kitten-tts-nano-0.1',
												'KittenML/kitten-tts-nano-0.2'
											],
											description: 'The input value that is provided in the "Model" Dropdown component.'
										}
									},
									return: {
										['data[0]']: {
											path: 'wav path in user gradio temp folder (eg. AppData\\Local\\Temp\\gradio\\)',
											url: 'url to gradio file url',
											size: 'wav size or null',
											mime_type: 'mime type or null',
											is_stream: 'true or false'
										},
										['data[1]']: "Phonetics tokens eg: tˈAk kˈɛɹ, ænd ɹəmˈɛmbəɹ",
										['data[2]']: 'query payload',
										['data[3]']: 'the tts web ui outputs folder for the generation (includes all files in various formats and metadata)',
									}
								},
								unloadModel: {
									uri: '/kokoro_unload_model',
									parameters: {
										model_name: {
											default: 'KittenML/kitten-tts-mini-0.1',
											description: 'The input value that is provided in the "Model" Dropdown component.'
										}
									},
									return: {
										['data[0]']: {
											path: 'wav path in user gradio temp folder (eg. AppData\\Local\\Temp\\gradio\\)',
											url: 'url to gradio file url',
											size: 'wav size or null',
											mime_type: 'mime type or null',
											is_stream: 'true or false'
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
}
