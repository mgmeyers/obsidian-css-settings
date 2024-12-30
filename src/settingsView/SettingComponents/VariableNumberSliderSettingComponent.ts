import { resetTooltip, VariableNumberSlider } from '../../SettingHandlers';
import { createDescription, getDescription, getTitle } from '../../Utils';
import { t } from '../../lang/helpers';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { debounce, Setting, SliderComponent } from 'obsidian';

export class VariableNumberSliderSettingComponent extends AbstractSettingComponent {
	settingEl: Setting;
	sliderComponent: SliderComponent;
	setting: VariableNumberSlider;

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

		this.settingEl.addSlider((slider) => {
			const value = this.settingsManager.getSetting(
				this.sectionId,
				this.setting.id
			);
			const onChange = debounce(
				(value: number) => {
					this.settingsManager.setSetting(
						this.sectionId,
						this.setting.id,
						value
					);
				},
				250,
				true
			);

			slider.setDynamicTooltip();
			slider.setLimits(this.setting.min, this.setting.max, this.setting.step);
			slider.setValue(
				value !== undefined ? (value as number) : this.setting.default
			);
			slider.onChange(onChange);

			this.sliderComponent = slider;
		});

		this.settingEl.addExtraButton((b) => {
			b.setIcon('reset');
			b.onClick(() => {
				this.sliderComponent.setValue(this.setting.default);
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
