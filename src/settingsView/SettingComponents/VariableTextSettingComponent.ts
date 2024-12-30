import { resetTooltip, VariableText } from '../../SettingHandlers';
import {
	createDescription,
	getDescription,
	getTitle,
	sanitizeText,
} from '../../Utils';
import { t } from '../../lang/helpers';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { debounce, Setting, TextComponent } from 'obsidian';

export class VariableTextSettingComponent extends AbstractSettingComponent {
	settingEl: Setting;
	textComponent: TextComponent;
	setting: VariableText;

	render(): void {
		if (!this.containerEl) return;
		const title = getTitle(this.setting);
		const description = getDescription(this.setting);

		if (typeof this.setting.default !== 'string') {
			return console.error(
				`${t('Error:')} ${title} ${t('missing default value')}`
			);
		}

		this.settingEl = new Setting(this.containerEl);
		this.settingEl.setName(title);
		this.settingEl.setDesc(
			createDescription(description, this.setting.default)
		);

		this.settingEl.addText((text) => {
			let value = this.settingsManager.getSetting(
				this.sectionId,
				this.setting.id
			);

			const onChange = debounce(
				(value: string) => {
					this.settingsManager.setSetting(
						this.sectionId,
						this.setting.id,
						sanitizeText(value)
					);
				},
				250,
				true
			);

			if (this.setting.quotes && value === `""`) {
				value = ``;
			}

			text.setValue(value ? value.toString() : this.setting.default);
			text.onChange(onChange);

			this.textComponent = text;
		});

		this.settingEl.addExtraButton((b) => {
			b.setIcon('reset');
			b.onClick(() => {
				this.textComponent.setValue(this.setting.default);
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
