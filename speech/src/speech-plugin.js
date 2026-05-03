import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import SpeechServer from './backend/server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms))
}

async function httpJson(url, { method = 'GET', body } = {}) {
	const headers = { 'content-type': 'application/json' }
	const res = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined
	})
	const text = await res.text()
	let json
	try {
		json = text ? JSON.parse(text) : null
	} catch {
		json = null
	}
	return { ok: res.ok, status: res.status, json, text }
}

function resolveRunCommand(browserCfg, platformKey) {
	const rc = browserCfg?.runCommand
	if (!rc) return null
	if (typeof rc === 'string') return rc
	if (typeof rc === 'object') {
		return rc?.[platformKey] || rc?.windows || rc?.linux || rc?.mac || null
	}
	return null
}

export default class SpeechPlugin {

	constructor({ config }) {
		this.config = config
		this.server = null
		this.browserProcess = null
	}

	static readConfigFile(configFilePath) {
		const raw = fs.readFileSync(configFilePath, 'utf-8')
		return JSON.parse(raw)
	}

	static fromDefaultConfigFile() {
		const configFilePath = path.resolve(__dirname, 'config', 'config.json')
		return new SpeechPlugin({ config: SpeechPlugin.readConfigFile(configFilePath) })
	}

	baseUrl() {
		return `http://localhost:${this.config.port}`
	}

	spaUrl() {
		return `${this.baseUrl()}/app/`
	}

	async waitForRunningStatus({ expected, timeoutMs = 30000, pollMs = 250 } = {}) {
		const start = Date.now()
		timeoutMs ||= 60000 * 10
		pollMs ||= 250
		while (Date.now() - start < timeoutMs) {
			const s = await this.getRunningStatus()
			if (s?.runningStatus === expected) return s
			await sleep(pollMs)
		}
		throw new Error(`timeout (${timeoutMs}) waiting for runningStatus='${expected}'`)
	}

	async launchServer() {
		try {
			if (this.server) return
			this.server = new SpeechServer({ config: this.config })
			return await this.server.start()
		} catch (err) {
			/*throw new Error*/ return ('launch server error: ' + err?.message)
		}
	}

	async stopServer() {
		if (!this.server) return
		await this.server.stop()
		this.server = null
	}

	async openBrowser() {
		const platformKey = (this.config?.platform || 'windows').toLowerCase()
		const browserKey = (this.config?.browser || 'edge').toLowerCase()
		const browserCfg = this.config?.browsers?.[browserKey]
		const cmd = resolveRunCommand(browserCfg, platformKey)
			|| resolveRunCommand(this.config?.browsers?.edge, platformKey)
			|| resolveRunCommand(this.config?.browsers?.chrome, platformKey)
		if (!cmd) return

		const url = this.spaUrl()
		const finalCmd = cmd.includes('{url}') ? cmd.replace('{url}', url) : `${cmd} ${url}`
		const p = spawn(finalCmd, {
			shell: true,
			detached: true,
			stdio: 'ignore'
		})
		p.unref()
		this.browserProcess = p
	}

	async speak({ sentence, voice, apiKey, timeout }) {
		timeout ||= 60000 * 10
		const res = await httpJson(`${this.baseUrl()}/speak`, {
			method: 'POST',
			body: {
				sentence,
				voice,
				apiKey
			}
		})
		if (!res.ok) throw new Error(`POST /speak failed: ${res.status} ${res.text}`)

		await this.waitForRunningStatus({ expected: 'speaking', timeoutMs: 10000 })
		await this.waitForRunningStatus({ expected: 'idle', timeoutMs: timeout })

		//console.log('SERVER: END SPEAK')

		return res.json
	}

	// turn off current speak if any
	async shetUp(apiKey) {
		const status = await this.getRunningStatus()
		if (status.runningStatus != 'speaking') return
		await this.speak({ sentence: '.', voice: null, apiKey })
	}

	async getRunningStatus() {
		const res = await httpJson(`${this.baseUrl()}/status`)
		if (!res.ok) throw new Error(`GET /status failed: ${res.status} ${res.text}`)
		return res.json
	}

	async getVoices() {
		const res = await httpJson(`${this.baseUrl()}/capabilities`)
		if (!res.ok) throw new Error(`GET /capabilities failed: ${res.status} ${res.text}`)
		return res.json
	}

	async waitForVoices({ timeoutMs = 30000, pollMs = 500 } = {}) {
		const start = Date.now()
		while (Date.now() - start < timeoutMs) {
			const caps = await this.getVoices()
			if (Array.isArray(caps?.voiceList) && caps.voiceList.length > 0) return caps.voiceList
			await sleep(pollMs)
		}
		throw new Error(`timeout waiting for voice capabilities (is the browser SPA connected?) open ${this.spaUrl()} and check that it shows 'connected'`)
	}
}
