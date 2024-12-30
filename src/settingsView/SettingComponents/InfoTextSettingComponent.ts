import { InfoText } from '../../SettingHandlers';
import { getDescription, getTitle } from '../../Utils';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { MarkdownRenderer, Setting } from 'obsidian';

export class InfoTextSettingComponent extends AbstractSettingComponent {
	settingEl: Setting;

	setting: InfoText;

	render(): void {
		if (!this.containerEl) return;
		const title = getTitle(this.setting);
		const description = getDescription(this.setting);

		this.settingEl = new Setting(this.containerEl);
		this.settingEl.setClass('style-settings-info-text');
		if (title) {
			this.settingEl.setName(title);
		}
		if (description) {
			if (this.setting.markdown) {
				MarkdownRenderer.renderMarkdown(
					description,
					this.settingEl.descEl,
					'',
					this
				);
				this.settingEl.descEl.addClass('style-settings-markdown');
			} else {
				this.settingEl.setDesc(description);
			}
		}

		this.settingEl.settingEl.dataset.id = this.setting.id;
	}

	destroy(): void {
		this.settingEl?.settingEl.remove();
	}
}
