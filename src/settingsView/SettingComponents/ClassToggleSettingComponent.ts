import { ClassToggle, resetTooltip } from '../../SettingHandlers';
import { getDescription, getTitle } from '../../Utils';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { Setting, ToggleComponent } from 'obsidian';

export class ClassToggleSettingComponent extends AbstractSettingComponent {
	settingEl: Setting;
	toggleComponent: ToggleComponent;
	setting: ClassToggle;

	render(): void {
		if (!this.containerEl) return;
		const title = getTitle(this.setting);
		const description = getDescription(this.setting);

		this.settingEl = new Setting(this.containerEl);
		this.settingEl.setName(title);
		this.settingEl.setDesc(description ?? '');

		this.settingEl.addToggle((toggle) => {
			const value = this.settingsManager.getSetting(
				this.sectionId,
				this.setting.id
			);

			toggle.setValue(value !== undefined ? !!value : !!this.setting.default);
			toggle.onChange((value) => {
				this.settingsManager.setSetting(this.sectionId, this.setting.id, value);
			});

			this.toggleComponent = toggle;
		});

		this.settingEl.addExtraButton((b) => {
			b.setIcon('reset');
			b.onClick(() => {
				const value = !!this.setting.default;

				this.toggleComponent.setValue(value);
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
