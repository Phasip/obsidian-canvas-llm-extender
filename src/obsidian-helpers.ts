import { Notice } from "obsidian";

export function notifyError(message: string) {
	new Notice(message, 5000)
	console.error(`llm-canvas-utils: ${message}`)
}

