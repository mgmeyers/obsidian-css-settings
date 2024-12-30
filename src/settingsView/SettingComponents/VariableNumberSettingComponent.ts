import { resetTooltip, VariableNumber } from '../../SettingHandlers';
import { createDescription, getDescription, getTitle } from '../../Utils';
import { t } from '../../lang/helpers';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { debounce, Setting, TextComponent } from 'obsidian';

export class VariableNumberSettingComponent extends AbstractSettingComponent {
	settingEl: Setting;
	textComponent: TextComponent;
	setting: VariableNumber;

	render(): void {
		if (!this.containerEl) return;
		const title = getTitle(this.setting);
		const description = getDescription(this.setting);

		if (typeof this.setting.default !== 'number') {
			return console.error(
				`${t('Error:')} ${title} ${t('missing default value')}`
			);
		}

		this.settingEl = new Setting(this.containerEl);
		this.settingEl.setName(title);
		this.settingEl.setDesc(
			createDescription(description, this.setting.default.toString(10))
		);

		this.settingEl.addText((text) => {
			const value = this.settingsManager.getSetting(
				this.sectionId,
				this.setting.id
			);
			const onChange = debounce(
				(value: string) => {
					const isFloat = /\./.test(value);
					this.settingsManager.setSetting(
						this.sectionId,
						this.setting.id,
						isFloat ? parseFloat(value) : parseInt(value, 10)
					);
				},
				250,
				true
			);

			text.setValue(
				value !== undefined ? value.toString() : this.setting.default.toString()
			);
			text.onChange(onChange);

			this.textComponent = text;
		});

		this.settingEl.addExtraButton((b) => {
			b.setIcon('reset');
			b.onClick(() => {
				this.textComponent.setValue(this.setting.default.toString());
				this.settingsManager.clearSetting(this.sectionId, this.setting.id);
			});
			b.setTooltip(resetTooltip);
		});

		this.settingEl.settingEl.dataset.id = this.setting.id;
	}

	destroy(): void {
		this.settingEl?.settingEl.remove();
	}
}
