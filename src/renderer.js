function mapStatusToText(status) {
	switch (status) {
		case 'DISABLED':
			return { chip: 'IDLE', sub: 'Waiting to start' }
		case 'SEARCHING DISCORD':
			return { chip: 'SEARCHING', sub: 'Looking for Discord process' }
		case 'CONNECTING RPC':
			return { chip: 'CONNECTING', sub: 'Attaching Rich Presence' }
		case 'ACTIVE':
			return { chip: 'ACTIVE', sub: 'Presence is broadcasting' }
		case 'RESTARTING':
			return { chip: 'RESTARTING', sub: 'Restarting Rich Presence' }
		case 'DISCONNECTED':
			return { chip: 'DISCONNECTED', sub: 'Lost connection to Discord' }
		case 'NO_CLIENT_ID':
			return { chip: 'NO CLIENT', sub: 'Set ID and links' }
		default:
			return { chip: 'UNKNOWN', sub: status || '' }
	}
}

function updateInfo(payload) {
	const title = document.getElementById('activity-title')
	const sub = document.getElementById('activity-sub')
	const infoButtons = document.getElementById('info-buttons')
	const infoObject = document.getElementById('info-object')
	const infoDetails = document.getElementById('info-details')
	const infoStatus = document.getElementById('info-status')
	const metaObject = document.getElementById('meta-object')
	const metaButtons = document.getElementById('meta-buttons')

	if (
		!title ||
		!sub ||
		!infoButtons ||
		!infoObject ||
		!infoDetails ||
		!infoStatus ||
		!metaObject ||
		!metaButtons
	) {
		return
	}

	if (!payload) {
		title.textContent = 'Idle'
		sub.textContent = 'Waiting for Discord'
		infoButtons.textContent = '–'
		infoObject.textContent = '–'
		infoDetails.textContent = '–'
		infoStatus.textContent = 'No active rich presence'
		metaObject.textContent = 'OBJECT: —'
		metaButtons.textContent = 'BUTTONS: —'
		return
	}

	title.textContent = payload.details || 'Rich Presence'
	sub.textContent = payload.state || ''
	const buttonsText =
		payload.buttons && payload.buttons.length
			? payload.buttons.map(b => b.label).join(' • ')
			: 'None'
	infoButtons.textContent = buttonsText
	infoObject.textContent = payload.object || '–'
	infoDetails.textContent = payload.extra || '–'
	infoStatus.textContent = 'Active'
	metaObject.textContent = `OBJECT: ${payload.object || '—'}`
	metaButtons.textContent = `BUTTONS: ${buttonsText}`
}

function updateStatus(status) {
	const chip = document.querySelector('.status-chip span')
	const statusDot = document.querySelector('.status-dot')
	const subLabel = document.getElementById('activity-sub')
	const { chip: chipText, sub: subText } = mapStatusToText(status)

	if (chip) chip.textContent = chipText
	if (subLabel) subLabel.textContent = subText

	if (statusDot) {
		if (status === 'ACTIVE') {
			statusDot.style.background =
				'radial-gradient(circle, #4ade80 0, #22c55e 50%, #000000 100%)'
		} else if (status === 'DISCONNECTED') {
			statusDot.style.background =
				'radial-gradient(circle, #fb7185 0, #f97373 50%, #000000 100%)'
		} else if (status === 'RESTARTING' || status === 'CONNECTING RPC') {
			statusDot.style.background =
				'radial-gradient(circle, #facc15 0, #eab308 50%, #000000 100%)'
		} else if (status === 'NO_CLIENT_ID') {
			statusDot.style.background =
				'radial-gradient(circle, #f97316 0, #ea580c 50%, #000000 100%)'
		} else {
			statusDot.style.background =
				'radial-gradient(circle, #ffffff 0, #ffffff 50%, #000000 100%)'
		}
	}
}

function setupRestartButton() {
	const btn = document.getElementById('restart-discord')
	if (!btn) return
	btn.addEventListener('click', () => {
		if (window.electronAPI?.restartDiscordRich) {
			updateStatus('RESTARTING')
			window.electronAPI.restartDiscordRich()
		}
	})
}

function setupClientIdControls() {
	const input = document.getElementById('client-id-input')
	const saveBtn = document.getElementById('client-id-save')
	const steamLabelInput = document.getElementById('steam-label-input')
	const steamUrlInput = document.getElementById('steam-url-input')
	const siteLabelInput = document.getElementById('site-label-input')
	const siteUrlInput = document.getElementById('site-url-input')
	if (
		!input ||
		!saveBtn ||
		!steamLabelInput ||
		!steamUrlInput ||
		!siteLabelInput ||
		!siteUrlInput
	)
		return

	input.value = localStorage.getItem('clientId') || ''
	steamLabelInput.value = localStorage.getItem('steamLabel') || 'My Steam'
	steamUrlInput.value =
		localStorage.getItem('steamUrl') ||
		'https://steamcommunity.com/id/Devollox/'
	siteLabelInput.value = localStorage.getItem('siteLabel') || 'My Website'
	siteUrlInput.value =
		localStorage.getItem('siteUrl') || 'https://devollox.fun/'

	async function saveAll() {
		const clientId = input.value.trim()
		const steamLabel = steamLabelInput.value.trim()
		const steamUrl = steamUrlInput.value.trim()
		const siteLabel = siteLabelInput.value.trim()
		const siteUrl = siteUrlInput.value.trim()

		if (!clientId || !steamLabel || !steamUrl || !siteLabel || !siteUrl) {
			updateStatus('NO_CLIENT_ID')
			return
		}

		localStorage.setItem('clientId', clientId)
		localStorage.setItem('steamLabel', steamLabel)
		localStorage.setItem('steamUrl', steamUrl)
		localStorage.setItem('siteLabel', siteLabel)
		localStorage.setItem('siteUrl', siteUrl)

		if (window.electronAPI?.setClientId) {
			await window.electronAPI.setClientId(clientId)
		}
		if (window.electronAPI?.setLinks) {
			await window.electronAPI.setLinks(
				steamLabel,
				steamUrl,
				siteLabel,
				siteUrl
			)
		}
		if (window.electronAPI?.restartDiscordRich) {
			await window.electronAPI.restartDiscordRich()
		}
	}

	saveBtn.addEventListener('click', () => {
		saveAll()
	})
}

function setupAutoLaunchToggle() {
	const toggle = document.getElementById('auto-launch-toggle')
	if (!toggle) return

	const saved = localStorage.getItem('autoLaunch') === 'true'
	toggle.dataset.on = saved ? 'true' : 'false'

	toggle.addEventListener('click', () => {
		const current = toggle.dataset.on === 'true'
		const next = !current
		toggle.dataset.on = next ? 'true' : 'false'
		localStorage.setItem('autoLaunch', String(next))
		if (window.electronAPI?.setAutoLaunch) {
			window.electronAPI.setAutoLaunch(next)
		}
	})
}

window.addEventListener('DOMContentLoaded', () => {
	setupRestartButton()
	setupClientIdControls()
	setupAutoLaunchToggle()
	updateInfo(null)
	updateStatus('DISABLED')

	if (window.electronAPI?.onRpcUpdate) {
		window.electronAPI.onRpcUpdate(payload => {
			updateInfo(payload)
		})
	}
	if (window.electronAPI?.onRpcStatus) {
		window.electronAPI.onRpcStatus(status => {
			updateStatus(status)
		})
	}
})
