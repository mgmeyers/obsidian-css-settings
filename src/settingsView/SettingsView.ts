import CSSSettingsPlugin from '../main';
import { SettingsMarkup } from './SettingsMarkup';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { ParsedCSSSettings } from 'src/SettingHandlers';
import { ErrorList } from 'src/Utils';

export const viewType = 'style-settings';

export class SettingsView extends ItemView {
	settingsMarkup: SettingsMarkup | null;
	plugin: CSSSettingsPlugin;

	constructor(plugin: CSSSettingsPlugin, leaf: WorkspaceLeaf) {
		super(leaf);
		this.plugin = plugin;
	}

	rerender() {
		this.settingsMarkup?.rerender();
	}

	settings: ParsedCSSSettings[];
	errorList: ErrorList;
	setSettings(settings: ParsedCSSSettings[], errorList: ErrorList) {
		this.settings = settings;
		this.errorList = errorList;
		if (this.settingsMarkup) {
			this.settingsMarkup.setSettings(settings, errorList);
		}
	}

	onload(): void {
		this.settingsMarkup = this.addChild(
			new SettingsMarkup(this.plugin.app, this.plugin, this.contentEl, true)
		);
		if (this.settings) {
			this.settingsMarkup.setSettings(this.settings, this.errorList);
		}
	}

	onunload(): void {
		this.settingsMarkup = null;
	}

	getViewType() {
		return viewType;
	}

	getIcon() {
		return 'gear';
	}

	getDisplayText() {
		return 'Style Settings';
	}
}
