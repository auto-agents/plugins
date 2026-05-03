import express from 'express'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { WebSocketServer } from 'ws'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default class SpeechServer {
	constructor({ config }) {
		this.config = config

		this.runningStatus = 'idle'
		this.voiceList = []
		this.wsClient = null
		this.lastActivity = null
		this.httpSockets = new Set()
	}

	start() {
		const app = express()
		app.use(express.json({ limit: '1mb' }))

		const spaDir = path.resolve(__dirname, '..', 'spa')
		app.use('/app', express.static(spaDir))

		app.get('/', (req, res) => {
			res.redirect('/app')
		})

		app.get('/status', (req, res) => {
			res.json({ runningStatus: this.runningStatus })
		})

		app.get('/config', (req, res) => {
			const maxLogLines = Number.isFinite(this.config?.maxLogLines) ? this.config.maxLogLines : 15
			res.json({ maxLogLines })
		})

		app.get('/capabilities', (req, res) => {
			res.json({ voiceList: this.voiceList })
		})

		app.post('/speak', (req, res) => {
			const { sentence, voice, apiKey } = req.body ?? {}
			if (apiKey !== this.config.apiKey) return res.status(401).json({ error: 'invalid apiKey' })
			if (!sentence || typeof sentence !== 'string') return res.status(400).json({ error: 'sentence is required' })
			if (!this.wsClient || this.wsClient.readyState !== 1) return res.status(503).json({ error: 'speech client not connected' })

			this.runningStatus = 'speaking'
			this.lastActivity = { sentence, voice: voice ?? null }
			this._sendWs({ type: 'SPEAK', sentence, voice: voice ?? null, preferredVoices: this._preferredVoices() })
			res.json({ runningStatus: this.runningStatus })
		})

		app.post('/stop', (req, res) => {
			this.runningStatus = 'idle'
			this.lastActivity = null
			if (this.wsClient && this.wsClient.readyState === 1) {
				this._sendWs({ type: 'STOP' })
			}
			res.json({ runningStatus: this.runningStatus })
		})

		const server = http.createServer(app)
		server.on('connection', (socket) => {
			this.httpSockets.add(socket)
			socket.on('close', () => {
				this.httpSockets.delete(socket)
			})
		})
		const wss = new WebSocketServer({ server, path: '/ws' })

		wss.on('connection', (ws) => {
			this.wsClient = ws

			ws.on('message', (raw) => {
				let msg
				try {
					msg = JSON.parse(raw.toString())
				} catch {
					return
				}
				this._handleWsMessage(msg)
			})

			ws.on('close', () => {
				if (this.wsClient === ws) this.wsClient = null
				this.runningStatus = 'idle'
			})

			this._sendWs({ type: 'HELLO' })
		})

		this.app = app
		this.server = server
		this.wss = wss

		return new Promise((resolve) => {
			try {
				server.listen(this.config.port, () => {
					resolve(true)
				})
			} catch (err) {
				//throw err
				resolve(false)
			}
		})
	}

	stop() {
		const tasks = []

		for (const socket of this.httpSockets) {
			try {
				socket.destroy()
			} catch {
				// ignore
			}
		}
		this.httpSockets.clear()

		if (this.wsClient) {
			try {
				this.wsClient.close()
			} catch {
				// ignore
			}
			this.wsClient = null
		}

		if (this.wss) {
			tasks.push(new Promise((resolve) => {
				try {
					//console.log('closing wss...')
					this.wss.close(() => resolve())
					//console.log('closed wss')
					this.wss = null
				} catch {
					resolve()
				}
			}))
		}

		if (this.server) {
			tasks.push(new Promise((resolve) => {
				try {
					//console.log('closing srv...')
					this.server.close(() => resolve())
					//console.log('closed srv')
					this.server = null
				} catch {
					resolve()
				}
			}))
		}

		this.runningStatus = 'idle'
		return Promise.all(tasks).then(() => {
			console.log('browser-tts SPA server stopped')
		})
	}

	_handleWsMessage(msg) {
		if (!msg || typeof msg !== 'object') return

		switch (msg.type) {
			case 'STATUS': {
				if (msg.runningStatus === 'idle' || msg.runningStatus === 'speaking') {
					this.runningStatus = msg.runningStatus
				}
				break
			}
			case 'CAPABILITIES': {
				if (Array.isArray(msg.voiceList)) this.voiceList = msg.voiceList
				break
			}
			case 'ERROR': {
				this.runningStatus = 'idle'
				break
			}
			default:
				break
		}
	}

	_sendWs(obj) {
		try {
			this.wsClient?.send(JSON.stringify(obj))
		} catch {
			// ignore
		}
	}

	_preferredVoices() {
		const browserKey = (this.config?.browser || 'edge').toLowerCase()
		const selected = this.config?.browsers?.[browserKey]?.preferredVoices
		const edge = this.config?.browsers?.edge?.preferredVoices
		const chrome = this.config?.browsers?.chrome?.preferredVoices
		if (Array.isArray(selected) && selected.length > 0) return selected
		if (Array.isArray(edge) && edge.length > 0) return edge
		if (Array.isArray(chrome) && chrome.length > 0) return chrome
		return []
	}
}
