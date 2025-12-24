import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	restartDiscordRich: () => ipcRenderer.invoke('restart-discord-rich'),
	onRpcUpdate: (callback: (payload: any) => void) => {
		ipcRenderer.on('rpc-update', (_event, payload) => callback(payload))
	},
	onRpcStatus: (callback: (status: string) => void) => {
		ipcRenderer.on('rpc-status', (_event, status) => callback(status))
	},
	setClientId: (clientId: string) =>
		ipcRenderer.invoke('set-client-id', clientId),
	setAutoLaunch: (enabled: boolean) =>
		ipcRenderer.invoke('set-auto-launch', enabled),
	setLinks: (
		steamLabel: string,
		steamUrl: string,
		siteLabel: string,
		siteUrl: string
	) =>
		ipcRenderer.invoke('set-links', {
			steamLabel,
			steamUrl,
			siteLabel,
			siteUrl,
		}),
	windowClose: () => ipcRenderer.invoke('window-close'),
	windowMinimize: () => ipcRenderer.invoke('window-minimize'),
})
