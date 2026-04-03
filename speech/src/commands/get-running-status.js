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
	const launch = hasFlag('--launch')

	if (launch) await mod.launchServer()
	const status = await mod.getRunningStatus()
	console.log(JSON.stringify(status, null, 2))
	if (launch) await mod.stopServer()
}

main().catch((e) => {
	console.error(e)
	process.exitCode = 1
})
