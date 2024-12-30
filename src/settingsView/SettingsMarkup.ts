import { CSSSetting, ParsedCSSSettings } from '../SettingHandlers';
import { ErrorList } from '../Utils';
import CSSSettingsPlugin from '../main';
import {
	buildSettingComponentTree,
	HeadingSettingComponent,
} from './SettingComponents/HeadingSettingComponent';
import { App, Component, Setting, debounce } from 'obsidian';

export class SettingsMarkup extends Component {
	app: App;
	plugin: CSSSettingsPlugin;
	settingsComponentTrees: HeadingSettingComponent[] = [];
	filterString: string = '';
	settings: ParsedCSSSettings[] = [];
	errorList: ErrorList = [];
	containerEl: HTMLElement;
	settingsContainerEl: HTMLElement;
	isView: boolean;

	constructor(
		app: App,
		plugin: CSSSettingsPlugin,
		containerEl: HTMLElement,
		isView?: boolean
	) {
		super();
		this.app = app;
		this.plugin = plugin;
		this.containerEl = containerEl;
		this.isView = !!isView;
	}

	onload(): void {
		this.display();
	}

	onunload(): void {
		this.settingsComponentTrees = [];
	}

	display(): void {
		this.generate(this.settings);
	}

	removeChildren() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			this.removeChild(settingsComponentTree);
		}
	}

	/**
	 * Recursively destroys all setting elements.
	 */
	cleanup() {
		this.removeChildren();
		this.settingsContainerEl?.empty();
	}

	setSettings(settings: ParsedCSSSettings[], errorList: ErrorList) {
		this.settings = settings;
		this.errorList = errorList;

		if (this.containerEl.parentNode) {
			this.generate(settings);
		}
	}

	displayErrors() {
		const { containerEl, errorList } = this;

		errorList.forEach((err) => {
			containerEl.createDiv({ cls: 'style-settings-error' }, (wrapper) => {
				wrapper.createDiv({
					cls: 'style-settings-error-name',
					text: `Error: ${err.name}`,
				});
				wrapper.createDiv({
					cls: 'style-settings-error-desc',
					text: err.error,
				});
			});
		});
	}

	displayEmpty() {
		const { containerEl } = this;

		containerEl.createDiv({ cls: 'style-settings-empty' }, (wrapper) => {
			wrapper.createDiv({
				cls: 'style-settings-empty-name',
				text: 'No style settings found',
			});
			wrapper.createDiv({ cls: 'style-settings-empty-desc' }).appendChild(
				createFragment((frag) => {
					frag.appendText(
						'Style settings configured by theme and plugin authors will show up here. You can also create your own configuration by creating a CSS snippet in your vault. '
					);
					frag.createEl('a', {
						text: 'Click here for details and examples.',
						href: 'https://github.com/mgmeyers/obsidian-style-settings#obsidian-style-settings-plugin',
					});
				})
			);
		});
	}

	generate(settings: ParsedCSSSettings[]) {
		const { containerEl, plugin } = this;

		containerEl.empty();

		this.cleanup();
		this.displayErrors();

		if (settings.length === 0) {
			return this.displayEmpty();
		}

		new Setting(containerEl).then((setting) => {
			// Build and import link to open the import modal
			setting.controlEl.createEl(
				'a',
				{
					cls: 'style-settings-import',
					text: 'Import',
					href: '#',
				},
				(el) => {
					el.addEventListener('click', (e) => {
						e.preventDefault();
						this.plugin.settingsManager.import();
					});
				}
			);

			// Build and export link to open the export modal
			setting.controlEl.createEl(
				'a',
				{
					cls: 'style-settings-export',
					text: 'Export',
					href: '#',
				},
				(el) => {
					el.addEventListener('click', (e) => {
						e.preventDefault();
						this.plugin.settingsManager.export(
							'All settings',
							this.plugin.settingsManager.settings
						);
					});
				}
			);

			// Searchbar
			setting.addSearch((searchComponent) => {
				searchComponent.setValue(this.filterString);
				searchComponent.onChange(
					debounce(
						(value) => {
							this.filterString = value;
							if (value) {
								this.filter();
							} else {
								this.clearFilter();
							}
						},
						250,
						true
					)
				);
				searchComponent.setPlaceholder('Search Style Settings...');
				// move the search component from the back to the front
				if (setting.controlEl.lastChild) {
					setting.nameEl.appendChild(setting.controlEl.lastChild);
				}
			});
		});

		this.settingsContainerEl = containerEl.createDiv();
		this.settingsComponentTrees = [];

		for (const s of settings) {
			const options: CSSSetting[] = [
				{
					id: s.id,
					type: 'heading',
					title: s.name,
					level: 0,
					collapsed: s.collapsed ?? true,
					resetFn: () => {
						plugin.settingsManager.clearSection(s.id);
						this.rerender();
					},
				},
				...s.settings,
			];

			try {
				const settingsComponentTree = buildSettingComponentTree({
					containerEl: this.settingsContainerEl,
					isView: this.isView,
					sectionId: s.id,
					sectionName: s.name,
					settings: options,
					settingsManager: plugin.settingsManager,
				});

				this.addChild(settingsComponentTree);
				this.settingsComponentTrees.push(settingsComponentTree);
			} catch (e) {
				console.error('Style Settings | Failed to render section', e);
			}
		}
	}

	/**
	 * Recursively filter all setting elements based on `filterString` and then re-renders.
	 */
	filter() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			settingsComponentTree.filter(this.filterString);
		}
	}

	/**
	 * Recursively clears the filter and then re-renders.
	 */
	clearFilter() {
		for (const settingsComponentTree of this.settingsComponentTrees) {
			settingsComponentTree.clearFilter();
		}
	}

	rerender() {
		this.cleanup();
		this.display();
	}
}
