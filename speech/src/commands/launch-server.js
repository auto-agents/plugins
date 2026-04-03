import path from 'path'
import { fileURLToPath } from 'url'
import SpeechPlugin from '../speech-plugin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getArgValue(name) {
	const idx = process.argv.indexOf(name)
	if (idx === -1) return null
	return process.argv[idx + 1] ?? null
}

async function main() {
	const configPath = getArgValue('--config') || path.resolve(__dirname, '..', 'config', 'config.json')
	const mod = new SpeechPlugin({ config: SpeechPlugin.readConfigFile(configPath) })

	await mod.launchServer()
	console.log(`listening on ${mod.baseUrl()}`)

	await new Promise((resolve) => {
		process.on('SIGINT', resolve)
		process.on('SIGTERM', resolve)
	})

	await mod.stopServer()
}

main().catch((e) => {
	console.error(e)
	process.exitCode = 1
})
