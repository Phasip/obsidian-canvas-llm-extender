import { PluginSettingTab, App, Setting } from "obsidian";
import {
    // @ts-ignore: Not sure why this fails, something with export default class...
    CanvasLLMExtendPlugin
} from "./main"

export interface CanvasLLMExtendPluginSettings {
    apiKey: string;
    model: string;
    temperature: number;
    defaultPrompt: string;
    baseUrl: string;
}

export const DEFAULT_SETTINGS: CanvasLLMExtendPluginSettings = {
    apiKey: 'sk-I0VQMCAgUGxlYXNlIERvbid0IFN0ZWFsIE15IFNlY3JldC4K',
    model: 'gpt-3.5-turbo',
    temperature: 1.0,
    defaultPrompt: 'I will present a part of a mindmap to you. I will present the text of the main node, its incoming nodes, its outgoing nodes and its siblings (that share one incoming node). I want you to suggest the text to a new outgoing node. The output will be used in a program so keep a similar tone and length to the other nodes and don\'t include anything else than the text of the new node in the response. Start your reply with "new outgoing node:"\n',
    baseUrl: ''
}

export class CanvasLLMExtendPluginSettingsTab extends PluginSettingTab {
    plugin: CanvasLLMExtendPlugin;

    constructor(app: App, plugin: CanvasLLMExtendPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("OpenAI API key")
            .setDesc("API key for OpenAI")
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.apiKey)
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value;
                        await this.plugin.saveSettings();
                    })
            );


        new Setting(containerEl)
            .setName("OpenAI model")
            .setDesc("Model from OpenAI to use for text generation")
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.model)
                    .setValue(this.plugin.settings.model)
                    .onChange(async (value) => {
                        this.plugin.settings.model = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("OpenAI temperature")
            .setDesc("Temperature for OpenAI (how wild the answers are)")
            .addSlider(
                slider => {
                    slider.setValue(this.plugin.settings.temperature)
                    .setLimits(0, 2, 0.1)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.temperature = value;
                        await this.plugin.saveSettings();
                    })});

        new Setting(containerEl)
                .setName("OpenAI base URL")
                .setDesc("Leave empty to use the official OpenAI endpoint (e.g. http://localhost:8080/v1 for a local server)")
                .addText(text =>
                    text
                        .setPlaceholder("http://localhost:8080/v1")
                        .setValue(this.plugin.settings.baseUrl)
                        .onChange(async (value) => {
                            this.plugin.settings.baseUrl = value.trim();
                            await this.plugin.saveSettings();
                        })
                );

        new Setting(containerEl)
            .setName("Prompt")
            .setDesc("Prompt before graph data is provided")
            .addTextArea(text =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.defaultPrompt)
                    .setValue(this.plugin.settings.defaultPrompt)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultPrompt = value;
                        await this.plugin.saveSettings();
                    })
            );

    }
}
