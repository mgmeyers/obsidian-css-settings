import { SettingValue } from './SettingsManager';
import CSSSettingsPlugin from './main';
import {
	App,
	ButtonComponent,
	Modal,
	Setting,
	TextAreaComponent,
} from 'obsidian';

export class ImportModal extends Modal {
	plugin: CSSSettingsPlugin;

	constructor(app: App, plugin: CSSSettingsPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl, modalEl } = this;

		modalEl.addClass('modal-style-settings');

		new Setting(contentEl)
			.setName('Import style setting')
			.setDesc(
				'Import an entire or partial configuration. Warning: this may override existing settings'
			);

		new Setting(contentEl).then((setting) => {
			// Build an error message container
			const errorSpan = createSpan({
				cls: 'style-settings-import-error',
				text: 'Error importing config',
			});

			setting.nameEl.appendChild(errorSpan);

			// Attempt to parse the imported data and close if successful
			const importAndClose = async (str: string) => {
				if (str) {
					try {
						const importedSettings = JSON.parse(str) as Record<
							string,
							SettingValue
						>;

						await this.plugin.settingsManager.setSettings(importedSettings);

						this.plugin.settingsTab.display();
						this.close();
					} catch (e) {
						errorSpan.addClass('active');
						errorSpan.setText(`Error importing style settings: ${e}`);
					}
				} else {
					errorSpan.addClass('active');
					errorSpan.setText(`Error importing style settings: config is empty`);
				}
			};

			// Build a file input
			setting.controlEl.createEl(
				'input',
				{
					cls: 'style-settings-import-input',
					attr: {
						id: 'style-settings-import-input',
						name: 'style-settings-import-input',
						type: 'file',
						accept: '.json',
					},
				},
				(importInput) => {
					// Set up a FileReader so we can parse the file contents
					importInput.addEventListener('change', (e) => {
						if (!e.target) return;

						const reader = new FileReader();

						reader.onload = async (e: ProgressEvent<FileReader>) => {
							if (!e.target?.result) return;
							await importAndClose(e.target.result.toString().trim());
						};

						const target = e.target as HTMLInputElement;
						if (target.files) {
							reader.readAsText(target.files[0]);
						}
					});
				}
			);

			// Build a label we will style as a link
			setting.controlEl.createEl('label', {
				cls: 'style-settings-import-label',
				text: 'Import from file',
				attr: {
					for: 'style-settings-import-input',
				},
			});

			new TextAreaComponent(contentEl)
				.setPlaceholder('Paste config here...')
				.then((ta) => {
					new ButtonComponent(contentEl)
						.setButtonText('Save')
						.onClick(async () => {
							await importAndClose(ta.getValue().trim());
						});
				});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
