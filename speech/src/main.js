import SpeechPlugin from './speech-plugin.js'

async function main() {
	const mod = SpeechPlugin.fromDefaultConfigFile()
	await mod.launchServer()
	await mod.openBrowser()
}

main().catch((e) => {
	console.error(e)
	process.exitCode = 1
})
