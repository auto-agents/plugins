import path from 'path'

export default function config(ctx) {
	return {
		modules: {
			TTSWebUI: {
				moduleId: 'TTSWebUI',
				description: 'module for TTS WebUI. currently supports extensions for Kokoro, Kitten',
				file: 'tts-web-ui-module.js',
				category: 'TTS',

				autoLoad: false,
				internal: true,
				enabled: false,
				isLoaded: false,

				config: {
					baseUrl: 'http://127.0.0.1:{port}',
					port: 7770,
					dumpSearchReferenceAudio: false,
					dumpImportReferenceAudio: false,
					paths: {
						basePath: 'E:\\DEV\\repos\\auto-agents-ext\\tts-webui-installer',
						voices: [
							// in modules path
							path.join(
								process.cwd(),
								ctx.paths.importModules,
								'TTS',
								'voices'
							),
							// path in basePath
							'voices/chatterbox',
						]
					},
					apis: {

						kokoroTTS: {
							bridgeFile: 'kokoro-tts.js',
							description: 'Kokoro is an open-weight TTS model with 82 million parameters. Despite its lightweight architecture, it delivers comparable quality to larger models while being significantly faster and more cost-efficient. With Apache-licensed weights, Kokoro can be deployed anywhere from production environments to personal projects.',
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
							description: 'Kitten TTS is an open-source, lightweight text-to-speech library built on ONNX. With models ranging from 15M to 80M parameters (25-80 MB on disk), it delivers high-quality voice synthesis on CPU without requiring a GPU.',
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
								}
							}
						},

						OpenVoiceV1: {
							bridgeFile: 'open-voice-v1.js',
							description: 'OpenVoice can accurately clone the reference tone color and generate speech in multiple languages and accents.  OpenVoice enables granular control over voice styles, such as emotion and accent, as well as other style parameters including rhythm, pauses, and intonation. Neither of the language of the generated speech nor the language of the reference speech needs to be presented in the massive-speaker multi-lingual training dataset.',
							paths: {
								speak: {
									uri: '/openvoice_v1',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										style: {
											default: 'default',
											possibleValues: [
												'default', 'whispering', 'cheerful', 'terrified', 'angry', 'sad', 'friendly'
											],
											description: 'The input value that is provided in the "Style" Dropdown component'
										},
										seed: {
											default: 2044339735,
											description: 'The input value that is provided in the "parameter_482" Textbox component.'
										},
										reference_audio: {
											default: 'alice.wav',
											description: 'The input value that is provided in the "Reference Audio" Audio component. The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded. Attributes: path: The server file path where the file is stored. url: The normalized server URL pointing to the file. size: The size of the file in bytes. orig_name: The original filename before upload. mime_type: The MIME type of the file. is_stream: Indicates whether the file is a stream. meta: Additional metadata used internally (should not be changed)'
										}
									},
									return: {
									}
								}
							}
						},

						OpenVoiceV2: {
							bridgeFile: 'open-voice-v2.js',
							description: 'OpenVoice can accurately clone the reference tone color and generate speech in multiple languages and accents.  OpenVoice enables granular control over voice styles, such as emotion and accent, as well as other style parameters including rhythm, pauses, and intonation. Neither of the language of the generated speech nor the language of the reference speech needs to be presented in the massive-speaker multi-lingual training dataset.',
							paths: {
								speak: {
									uri: '/openvoice_v2',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										speaker_accent: {
											default: 'default',
											possibleValues: [
												'default', 'whispering', 'cheerful', 'terrified', 'angry', 'sad', 'friendly'
											],
											description: 'The input value that is provided in the "Style" Dropdown component'
										},
										language_code: {
											default: 'fr',
											possibleValues: ['en', 'fr'],
											description: 'language code'
										},
										seed: {
											default: 2044339735,
											description: 'The input value that is provided in the "parameter_482" Textbox component.'
										},
										reference_audio: {
											default: 'alice.wav',
											description: 'The input value that is provided in the "Reference Audio" Audio component. The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded. Attributes: path: The server file path where the file is stored. url: The normalized server URL pointing to the file. size: The size of the file in bytes. orig_name: The original filename before upload. mime_type: The MIME type of the file. is_stream: Indicates whether the file is a stream. meta: Additional metadata used internally (should not be changed)'
										}
									},
									return: {
									}
								}
							}
						},
					}
				}
			}
		}
	}
}
