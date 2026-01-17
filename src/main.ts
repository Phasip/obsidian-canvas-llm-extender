import { Plugin, Menu, MenuItem } from "obsidian";
import {
    addNodeChild,
    getNodeNeighbours,
    isCanvasNodeData
} from "./obsidian-canvas-utils";

import {
    notifyError
} from "./obsidian-helpers";

import {
    openai_get_reply
} from "./openai-utils";

import {
    DEFAULT_SETTINGS,
    CanvasLLMExtendPluginSettings,
    CanvasLLMExtendPluginSettingsTab
} from "./settings";
export default class CanvasLLMExtendPlugin extends Plugin {
    settings: CanvasLLMExtendPluginSettings;

    async onload() {
        try {
            await this.loadSettings();
        } catch (error) {
            notifyError(`Error loading settings: ${error}`);
        }

          
        // Add a new menu item to the canvas node menu
        this.registerEvent(this.app.workspace.on("canvas:node-menu", (menu: Menu, node: unknown) => {
                menu.addItem((i: MenuItem) => {
                    i.setSection("canvasLLMExtend");
                    i.setTitle("LLM Extend");
                    i.onClick((_e: unknown) => {
                        this.extendNode(node);
                    });
                });
            }
        ));

        this.addSettingTab(new CanvasLLMExtendPluginSettingsTab(this.app, this));
    }

    async extendNode(node: unknown) {
        if (!isCanvasNodeData(node)) {
            notifyError("Node is not Canvas Node");
            return;
        }

        const d = getNodeNeighbours(node);
        let prompt = `${this.settings.defaultPrompt}\n`;
        d.incoming.forEach(incoming => 
                getNodeNeighbours(incoming).outgoing.forEach(sibling => 
                    prompt += `Sibling: ${sibling.text}\n`
                )
            );
        d.incoming.forEach(incoming => prompt += `Incoming: ${incoming.text}\n`);
        prompt += `Main: ${node.text}\n`;
        d.outgoing.forEach(outgoing => prompt += `Outgoing: ${outgoing.text}\n`);

        let r = await openai_get_reply(prompt, this.settings.model, this.settings.temperature, this.settings.apiKey, this.settings.baseUrl);
        if (r == null) {
            notifyError("Failed to get reply from OpenAI");
            return;
        }

        const banned = ["outgoing:", "new outgoing:","new outgoing node:","new node:","node:","additional item:","item:"];
        for (const banword of banned) {
            if (r.toLowerCase().startsWith(banword)) {
                r = r.substring(banword.length);
            }
        }

        addNodeChild(node, r.trim());
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
