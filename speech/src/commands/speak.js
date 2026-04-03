import path from 'path'
import { fileURLToPath } from 'url'
import SpeechPlugin from '../speech-plugin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function hasFlag(name) {
	return process.argv.includes(name)
}

function getArgValue(name) {
	const idx = process.argv.indexOf(name)
	if (idx === -1) return null
	return process.argv[idx + 1] ?? null
}

async function main() {
	const configPath = getArgValue('--config') || path.resolve(__dirname, '..', 'config', 'config.json')
	const mod = new SpeechPlugin({ config: SpeechPlugin.readConfigFile(configPath) })

	const sentence = getArgValue('--sentence')
	if (!sentence) throw new Error('missing --sentence')

	const voice = getArgValue('--voice') ?? ''
	const apiKey = getArgValue('--apiKey') ?? mod.config.apiKey
	const noLaunch = hasFlag('--no-launch')
	const noBrowser = hasFlag('--no-browser')

	if (!noLaunch) await mod.launchServer()
	if (!noBrowser) await mod.openBrowser()

	let selectedVoice = voice
	if (!selectedVoice) {
		const voiceList = await mod.waitForVoices()
		selectedVoice = voiceList[0]?.name
	}
	if (!selectedVoice) throw new Error('no voice available')

	await mod.speak({ sentence, voice: selectedVoice, apiKey })
	console.log('spoken')

	if (!noLaunch) await mod.stopServer()
}

main().catch((e) => {
	console.error(e)
	process.exitCode = 1
})
