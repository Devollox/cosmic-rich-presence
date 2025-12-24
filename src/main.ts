import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron'
import * as path from 'path'
import startDiscordRich, {
	setClientId,
	setLinksConfig,
	stopDiscordRich,
} from './discord'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function getAssetPath(...segments: string[]) {
	const appPath = app.isPackaged ? app.getAppPath() : process.cwd()
	return path.join(appPath, ...segments)
}

const iconPath = getAssetPath('public', 'favicons', 'dark-fav.png')

function sendStatus(status: string) {
	const win = BrowserWindow.getAllWindows()[0]
	if (!win || win.isDestroyed()) return
	win.webContents.send('rpc-status', status)
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 460,
		resizable: false,
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
		},
	})

	mainWindow.setMenuBarVisibility(false)
	mainWindow.loadFile('index.html')

	sendStatus('DISABLED')

	startDiscordRich(
		(payload: any) => {
			if (!mainWindow || mainWindow.isDestroyed()) return
			mainWindow.webContents.send('rpc-update', payload)
		},
		(status: string) => {
			sendStatus(status)
		}
	)

	mainWindow.on('close', ev => {
		if (mainWindow && mainWindow.isVisible()) {
			ev.preventDefault()
			mainWindow.hide()
		}
	})
}

function createTray() {
	const contextMenu = Menu.buildFromTemplate([
		{ type: 'separator' },
		{
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Q',
			click: () => {
				BrowserWindow.getAllWindows().forEach(w => w.destroy())
				stopDiscordRich()
				app.quit()
			},
		},
	])

	tray = new Tray(iconPath)
	tray.setToolTip('Rich Presence')
	tray.setContextMenu(contextMenu)
	tray.on('click', () => {
		const win = BrowserWindow.getAllWindows()[0]
		if (win) win.show()
	})
}

app.whenReady().then(() => {
	createWindow()
	createTray()
})

app.on('activate', () => {
	const window = BrowserWindow.getAllWindows()[0]
	if (window) {
		window.show()
	} else {
		createWindow()
	}
})

ipcMain.handle('restart-discord-rich', async () => {
	const win = BrowserWindow.getAllWindows()[0]
	if (!win || win.isDestroyed()) return
	sendStatus('RESTARTING')
	stopDiscordRich()
	startDiscordRich(
		(payload: any) => {
			if (win.isDestroyed()) return
			win.webContents.send('rpc-update', payload)
		},
		(status: string) => {
			sendStatus(status)
		}
	)
})

ipcMain.handle('set-client-id', async (_event, clientId: string) => {
	await setClientId(clientId)
	return true
})

ipcMain.handle(
	'set-links',
	async (
		_event,
		data: {
			steamLabel: string
			steamUrl: string
			siteLabel: string
			siteUrl: string
		}
	) => {
		await setLinksConfig(
			data.steamLabel,
			data.steamUrl,
			data.siteLabel,
			data.siteUrl
		)
		return true
	}
)

function setAutoLaunch(enabled: boolean) {
	app.setLoginItemSettings({
		openAtLogin: enabled,
		path: app.getPath('exe'),
		args: [],
	})
}

ipcMain.handle('set-auto-launch', async (_event, enabled: boolean) => {
	setAutoLaunch(enabled)
	return true
})
