import path from 'path'

export default function config(ctx) {

	return {
		cli: {
			tempsToClean: [
				// add you settings here
				"E:\\DEV\repos\\auto-agents-ext\\tts-webui-installer\\outputs",
				"C:\\Users\\franc\\AppData\\Local\\Temp\\gradio\\"
			]
		},
		plugins: {
			TTSWebUI: {
				pluginId: 'TTSWebUI',
				description: 'plugin for TTS WebUI. Supports extensions for Kokoro, Kitten, OpenVoice V1 & V2, Chatterbox, XTTS',
				file: 'tts-web-ui-plugin.js',
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
					// todo: load plugin import from this plugin
					soundPlayerPlugin: 'Sound/shell-player',
					paths: {
						// todo: dynamic path
						basePath: 'E:\\DEV\\repos\\auto-agents-ext\\tts-webui-installer',
						voices: [
							// in plugins path
							path.join(
								process.cwd(),
								ctx.paths.importPlugins,
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

						openVoiceV1: {
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

						openVoiceV2: {
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
										speed: {
											default: 1,
											description: 'The input value that is provided in the "Speed" Slider component.'
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

						chatterBox: {
							bridgeFile: 'chatter-box.js',
							description: 'Chatterbox is a family of three state-of-the-art, open-source text-to-speech models by Resemble AI.',
							paths: {
								speak: {
									uri: '/chatterbox_tts',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										exaggeration: {
											default: 0.5,
											description: 'exaggeration'
										},
										cfg_weight: {
											default: 0.5,
											description: 'cfg_weight'
										},
										temperature: {
											default: 0.8,
											description: 'temperature'
										},
										audio_prompt_path: {
											default: 'alice.wav',
											description: 'The input value that is provided in the "Reference Audio" Audio component. The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded. Attributes: path: The server file path where the file is stored. url: The normalized server URL pointing to the file. size: The size of the file in bytes. orig_name: The original filename before upload. mime_type: The MIME type of the file. is_stream: Indicates whether the file is a stream. meta: Additional metadata used internally (should not be changed)'
										},
										device: {
											default: 'auto'
										},
										dtype: {
											default: 'bfloat16'
										},
										model_name: {
											default: 'multilingual',
											possibleValues: ['just_a_placeholder', 'multilingual']
										},
										chunked: {
											default: false
										},
										cpu_offload: {
											default: false
										},
										cache_voice: {
											default: true
										},
										desired_length: {
											default: 200
										},
										max_length: {
											default: 300
										},
										halve_first_chunk: {
											default: false
										},
										initial_forward_pass_backend: {
											default: 'eager'
										},
										generate_token_backend: {
											default: 'cudagraphs-manual',
											possibleValues: ['cudagraphs-manual', 'eager', 'cudagraphs', 'inductor', 'cudagraphs - strided', 'inductor - strided']
										},
										max_new_tokens: {
											default: 1000
										},
										max_cache_len: {
											default: 1500
										},
										language_id: {
											default: 'fr',
											possibleValues: ['en', 'fr'],
											description: 'language id'
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
								}
							}
						},

						xttsSimple: {
							bridgeFile: 'xtts-simple.js',
							description: 'a Voice generation model that lets you clone voices into different languages by using just a quick 6-second audio clip. There is no need for an excessive amount of training data that spans countless hours. This is the same or similar model to what powers Coqui Studio and Coqui API',
							paths: {
								speak: {
									uri: '/xtts_simple',
									parameters: {
										text: {
											description: 'The input value that is provided in the "Text to generate" Textbox component.'
										},
										model_name: {
											default: 'E:\\DEV\\repos\\auto-agents-ext\\tts-webui-installer\\data\\models\\xtts\\base',
											description: 'model name',
											possibleValues: ['base',
												// specific to install path
												'E:\\DEV\\repos\\auto-agents-ext\\tts-webui-installer\\data\\models\\xtts\\base']
										},
										language: {
											default: 'fr',
											possibleValues: ['en', 'fr'],
											description: 'language code'
										},
										speaker: {
											default: null
										},
										seed: {
											default: 2044339735,
											description: 'The input value that is provided in the "parameter_482" Textbox component.'
										},
										voice: {
											default: 'alice.wav',
											description: 'The input value that is provided in the "Reference Audio" Audio component. The FileData class is a subclass of the GradioModel class that represents a file object within a Gradio interface. It is used to store file data and metadata when a file is uploaded. Attributes: path: The server file path where the file is stored. url: The normalized server URL pointing to the file. size: The size of the file in bytes. orig_name: The original filename before upload. mime_type: The MIME type of the file. is_stream: Indicates whether the file is a stream. meta: Additional metadata used internally (should not be changed)'
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
					}
				}
			}
		}
	}
}
