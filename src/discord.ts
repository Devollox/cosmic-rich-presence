import { app } from 'electron'
import { promises as fs } from 'fs'
import * as path from 'path'
import { astronomicalObjects } from './cosmos'
const rpc = require('discord-rpc')
const ps = require('ps-node')

const processName = 'Discord.exe'
const STORAGE_FILE = './storage.json'

let client: any = null
let toggleButton = false
let activityTimer: NodeJS.Timeout | null = null
let restartTimer: NodeJS.Timeout | null = null
let restartInterval: NodeJS.Timeout | null = null

export type RpcPayload = {
	details: string
	state: string
	coordinates: string
	buttons: { label: string; url: string }[]
	object: string
	extra: string
}

type ClientConfig = {
	clientId: string | null
}

type LinksConfig = {
	steamLabel: string | null
	steamUrl: string | null
	siteLabel: string | null
	siteUrl: string | null
}

function getClientConfigPath() {
	const userData = app.getPath('userData')
	return path.join(userData, 'client-config.json')
}

function getLinksConfigPath() {
	const userData = app.getPath('userData')
	return path.join(userData, 'links-config.json')
}

async function readClientConfig(): Promise<ClientConfig> {
	const configPath = getClientConfigPath()
	try {
		const raw = await fs.readFile(configPath, 'utf-8')
		const parsed = JSON.parse(raw) as Partial<ClientConfig>
		return {
			clientId:
				typeof parsed.clientId === 'string' && parsed.clientId.trim().length > 0
					? parsed.clientId.trim()
					: null,
		}
	} catch {
		return { clientId: null }
	}
}

async function writeClientConfig(config: ClientConfig) {
	const configPath = getClientConfigPath()
	await fs.writeFile(configPath, JSON.stringify(config, null, 2))
}

async function readLinksConfig(): Promise<LinksConfig> {
	const configPath = getLinksConfigPath()
	try {
		const raw = await fs.readFile(configPath, 'utf-8')
		const parsed = JSON.parse(raw) as Partial<LinksConfig>
		return {
			steamLabel:
				typeof parsed.steamLabel === 'string' &&
				parsed.steamLabel.trim().length > 0
					? parsed.steamLabel.trim()
					: null,
			steamUrl:
				typeof parsed.steamUrl === 'string' && parsed.steamUrl.trim().length > 0
					? parsed.steamUrl.trim()
					: null,
			siteLabel:
				typeof parsed.siteLabel === 'string' &&
				parsed.siteLabel.trim().length > 0
					? parsed.siteLabel.trim()
					: null,
			siteUrl:
				typeof parsed.siteUrl === 'string' && parsed.siteUrl.trim().length > 0
					? parsed.siteUrl.trim()
					: null,
		}
	} catch {
		return {
			steamLabel: null,
			steamUrl: null,
			siteLabel: null,
			siteUrl: null,
		}
	}
}

async function writeLinksConfig(config: LinksConfig) {
	const configPath = getLinksConfigPath()
	await fs.writeFile(configPath, JSON.stringify(config, null, 2))
}

export async function setClientId(clientId: string) {
	const cfg = await readClientConfig()
	cfg.clientId = clientId.trim() || null
	await writeClientConfig(cfg)
}

export async function setLinksConfig(
	steamLabel: string,
	steamUrl: string,
	siteLabel: string,
	siteUrl: string
) {
	const cfg: LinksConfig = {
		steamLabel: steamLabel.trim() || null,
		steamUrl: steamUrl.trim() || null,
		siteLabel: siteLabel.trim() || null,
		siteUrl: siteUrl.trim() || null,
	}
	await writeLinksConfig(cfg)
}

async function readStorage() {
	try {
		const data = await fs.readFile(STORAGE_FILE, 'utf-8')
		const storage = JSON.parse(data)
		if (!storage.discoveries || !Array.isArray(storage.discoveries)) {
			storage.discoveries = []
		}
		return storage as { currentIndex: number; discoveries: string[] }
	} catch {
		return { currentIndex: 0, discoveries: [] }
	}
}

async function writeStorage(storage: any) {
	await fs.writeFile(STORAGE_FILE, JSON.stringify(storage))
}

async function clearStorage() {
	await fs.writeFile(
		STORAGE_FILE,
		JSON.stringify({ currentIndex: 0, discoveries: [] })
	)
}

function createClient() {
	if (client) {
		try {
			client.clearActivity()
		} catch {}
		try {
			client.destroy()
		} catch {}
		client = null
	}
	client = new rpc.Client({ transport: 'ipc' })
	return client
}

export function stopDiscordRich() {
	if (activityTimer) {
		clearTimeout(activityTimer)
		activityTimer = null
	}
	if (restartTimer) {
		clearTimeout(restartTimer)
		restartTimer = null
	}
	if (restartInterval) {
		clearInterval(restartInterval)
		restartInterval = null
	}
	if (client) {
		try {
			client.clearActivity()
		} catch {}
		try {
			client.destroy()
		} catch {}
		client = null
	}
}

function formatCoordinates(coordinates: [any, any]) {
	const [ra, dec] = coordinates
	const raHours = Math.floor(ra / 15)
	const raMinutes = Math.floor((ra % 15) * 4)
	const raSeconds = Math.round(((ra % 15) * 4 - raMinutes) * 60)
	const decDegrees = Math.floor(dec)
	const decMinutes = Math.floor(Math.abs((dec - decDegrees) * 60))
	const decSeconds = Math.round(
		Math.abs((dec - decDegrees) * 60 - decMinutes) * 60
	)
	const formattedRA = `${raHours >= 0 ? '+' : ''}${raHours}° ${Math.abs(
		raMinutes
	)}′ ${Math.abs(raSeconds)}″`
	const formattedDec = `${decDegrees >= 0 ? '+' : ''}${Math.abs(
		decDegrees
	)}° ${Math.abs(decMinutes)}′ ${Math.abs(decSeconds)}″`
	return `${formattedRA} ${formattedDec}`
}

function startDiscordRich(
	sendPayload: (payload: RpcPayload) => void,
	sendStatus: (status: string) => void
) {
	async function startSession() {
		const { clientId } = await readClientConfig()
		const links = await readLinksConfig()

		if (
			!clientId ||
			!links.steamLabel ||
			!links.steamUrl ||
			!links.siteLabel ||
			!links.siteUrl
		) {
			sendStatus('NO_CLIENT_ID')
			return
		}

		const steamLabel = links.steamLabel
		const steamUrl = links.steamUrl
		const siteLabel = links.siteLabel
		const siteUrl = links.siteUrl

		const localClient = createClient()
		let timestamps: { start: number } | null = null
		const storage = await readStorage()
		let lastObject: (typeof astronomicalObjects)[number] | null = null

		async function fetchActivity() {
			if (!timestamps) {
				timestamps = { start: Date.now() }
			}

			let randomObject = lastObject
			if (!randomObject) {
				if (storage.discoveries.length === astronomicalObjects.length) {
					storage.discoveries = []
				}

				do {
					randomObject =
						astronomicalObjects[
							Math.floor(Math.random() * astronomicalObjects.length)
						]
				} while (
					!randomObject ||
					storage.discoveries.includes(randomObject.name)
				)

				lastObject = randomObject
			}

			const initialCoordinates = `Coordinates: ${formatCoordinates(
				randomObject.coordinates
			)}`

			const buttons: { label: string; url: string }[] = []

			if (randomObject.name != null && randomObject.name.trim() !== '') {
				const objectName = encodeURIComponent(randomObject.name)
				buttons.push({
					label: 'Space Object',
					url: `https://www.sky-map.org/?img_source=${randomObject.typePhoto}&object=${objectName}&zoom=${randomObject.zoom}`,
				})
			}

			toggleButton = !toggleButton
			if (toggleButton) {
				buttons.push({
					label: steamLabel!,
					url: steamUrl!,
				})
			} else {
				buttons.push({
					label: siteLabel!,
					url: siteUrl!,
				})
			}

			localClient.request('SET_ACTIVITY', {
				pid: process.pid,
				activity: {
					details: `Observing: ${randomObject.name}`,
					state: initialCoordinates,
					assets: {
						large_image:
							'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGE0ZXVvY3QwbmkyN2Vkbmg3ZHo1OXZkcW13OXU4aHphaWpvbndiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PkKzNQjwPy7GvxZbfe/giphy.gif',
						large_text: `${randomObject.description}`,
						small_image: undefined,
						small_text: undefined,
					},
					timestamps,
					buttons,
				},
			})

			sendStatus('ACTIVE')

			sendPayload({
				details: `Observing: ${randomObject.name}`,
				state: initialCoordinates,
				coordinates: initialCoordinates,
				buttons,
				object: randomObject.name,
				extra: randomObject.description,
			})

			if (activityTimer) {
				clearTimeout(activityTimer)
			}
			activityTimer = setTimeout(async () => {
				const stateDetails = [
					randomObject.mass
						? `Mass: ${randomObject.mass.value.toExponential(2)} ${
								randomObject.mass.unit
						  }`
						: '',
					randomObject.distance
						? `Distance: ${randomObject.distance.value} ${randomObject.distance.unit}`
						: '',
					randomObject.apparentMagnitude
						? `Apparent magnitude: ${randomObject.apparentMagnitude}`
						: '',
					randomObject.velocity
						? `Velocity: ${randomObject.velocity.value} ${randomObject.velocity.unit}`
						: '',
					randomObject.redshift
						? `Redshift: ${randomObject.redshift.value} (error: ${randomObject.redshift.error})`
						: '',
					randomObject.radius
						? `Radius: ${randomObject.radius.value} ${randomObject.radius.unit}`
						: '',
				]

				function getRandomDetails(details: string[], count: number) {
					const filtered = details.filter(Boolean)
					const shuffled = filtered.sort(() => 0.5 - Math.random())
					return shuffled.slice(0, count)
				}

				storage.discoveries.push(randomObject.name)
				await writeStorage(storage)
				await clearStorage()

				const randomUseDetails = Math.random() < 0.85
				let state = randomUseDetails
					? `${randomObject.type} - ${getRandomDetails(stateDetails, 4).join(
							' '
					  )}`
					: `${randomObject.description}`

				if (state.length >= 115) {
					state = `${randomObject.type} - ${getRandomDetails(
						stateDetails,
						3
					).join(' ')}`
				}
				if (state.length >= 115) {
					state = `${randomObject.type} - ${getRandomDetails(
						stateDetails,
						2
					).join(' ')}`
				}

				localClient.request('SET_ACTIVITY', {
					pid: process.pid,
					activity: {
						details: `Observing: ${randomObject.name}`,
						state: `Explored: ${state}`,
						assets: {
							large_image:
								'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGE0ZXVvY3QwbmkyN2Vkbmg3ZHo1OXZkcW13OXU4aHphaWpvbndiNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PkKzNQjwPy7GvxZbfe/giphy.gif',
							large_text: `${randomObject.description}`,
							small_image: undefined,
							small_text: undefined,
						},
						timestamps,
						buttons,
					},
				})

				sendPayload({
					details: `Observing: ${randomObject.name}`,
					state: `Explored: ${state}`,
					coordinates: initialCoordinates,
					buttons,
					object: randomObject.name,
					extra: randomObject.description,
				})

				lastObject = null
			}, 10000)
		}

		sendStatus('CONNECTING RPC')

		localClient.on('ready', async () => {
			await fetchActivity()
			if (restartInterval) {
				clearInterval(restartInterval)
			}
			restartInterval = setInterval(() => {
				fetchActivity()
			}, 45000)
		})

		localClient.on('disconnected', () => {
			sendStatus('DISCONNECTED')
			if (restartTimer) {
				clearTimeout(restartTimer)
			}
			restartTimer = setTimeout(findAndRestartProcess, 3000)
		})

		localClient.on('error', () => {
			sendStatus('DISCONNECTED')
			if (restartTimer) {
				clearTimeout(restartTimer)
			}
			restartTimer = setTimeout(findAndRestartProcess, 3000)
		})

		localClient.login({ clientId }).catch((e: any) => {
			console.error('rpc login error', e)
			sendStatus('DISCONNECTED')
			if (restartTimer) {
				clearTimeout(restartTimer)
			}
			restartTimer = setTimeout(findAndRestartProcess, 3000)
		})
	}

	function restartProcess() {
		ps.lookup({ command: processName }, (err: any, resultList: any[]) => {
			if (err) {
				console.error(err)
				return
			}
			if (resultList.length <= 1) {
				sendStatus('SEARCHING DISCORD')
				findAndRestartProcess()
			} else {
				sendStatus('CONNECTING RPC')
			}
		})
	}

	function findAndRestartProcess() {
		ps.lookup({ command: processName }, (err: any, resultList: any[]) => {
			if (err) {
				console.error(err)
				sendStatus('DISCONNECTED')
				return
			}
			if (resultList.length === 0) {
				sendStatus('SEARCHING DISCORD')
				if (restartTimer) {
					clearTimeout(restartTimer)
				}
				restartTimer = setTimeout(findAndRestartProcess, 5000)
			} else {
				if (restartTimer) {
					clearTimeout(restartTimer)
				}
				restartTimer = setTimeout(startSession, 25000)
				if (restartInterval) {
					clearInterval(restartInterval)
				}
				restartInterval = setInterval(restartProcess, 3600000)
			}
		})
	}

	findAndRestartProcess()
}

export { readClientConfig }
export default startDiscordRich
