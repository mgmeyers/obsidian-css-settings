import { CSSSetting, Heading } from '../../SettingHandlers';
import { getDescription, getTitle } from '../../Utils';
import { AbstractSettingComponent } from './AbstractSettingComponent';
import { ClassMultiToggleSettingComponent } from './ClassMultiToggleSettingComponent';
import { ClassToggleSettingComponent } from './ClassToggleSettingComponent';
import { InfoTextSettingComponent } from './InfoTextSettingComponent';
import { VariableColorSettingComponent } from './VariableColorSettingComponent';
import { VariableNumberSettingComponent } from './VariableNumberSettingComponent';
import { VariableNumberSliderSettingComponent } from './VariableNumberSliderSettingComponent';
import { VariableSelectSettingComponent } from './VariableSelectSettingComponent';
import { VariableTextSettingComponent } from './VariableTextSettingComponent';
import { VariableThemedColorSettingComponent } from './VariableThemedColorSettingComponent';
import { SettingType } from './types';
import { setIcon, Setting } from 'obsidian';
import { CSSSettingsManager } from 'src/SettingsManager';

export function createSettingComponent(
	parent: AbstractSettingComponent,
	sectionId: string,
	sectionName: string,
	setting: CSSSetting,
	settingsManager: CSSSettingsManager,
	isView: boolean
): AbstractSettingComponent | undefined {
	if (setting.type === SettingType.HEADING) {
		return new HeadingSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.INFO_TEXT) {
		return new InfoTextSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.CLASS_TOGGLE) {
		return new ClassToggleSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.CLASS_SELECT) {
		return new ClassMultiToggleSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_TEXT) {
		return new VariableTextSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_NUMBER) {
		return new VariableNumberSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_NUMBER_SLIDER) {
		return new VariableNumberSliderSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_SELECT) {
		return new VariableSelectSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_COLOR) {
		return new VariableColorSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else if (setting.type === SettingType.VARIABLE_THEMED_COLOR) {
		return new VariableThemedColorSettingComponent(
			parent,
			sectionId,
			sectionName,
			setting,
			settingsManager,
			isView
		);
	} else {
		return undefined;
	}
}

export function buildSettingComponentTree(opts: {
	containerEl: HTMLElement;
	isView: boolean;
	sectionId: string;
	sectionName: string;
	settings: CSSSetting[];
	settingsManager: CSSSettingsManager;
}): HeadingSettingComponent {
	const {
		containerEl,
		isView,
		sectionId,
		settings,
		settingsManager,
		sectionName,
	} = opts;

	const root: HeadingSettingComponent = new HeadingSettingComponent(
		containerEl,
		sectionId,
		sectionName,
		settings[0],
		settingsManager,
		isView
	);

	let currentHeading: HeadingSettingComponent = root;

	for (const setting of settings.splice(1)) {
		if (setting.type === 'heading') {
			const newHeading: Heading = setting as Heading;

			if (newHeading.level < currentHeading.setting.level) {
				while (newHeading.level < currentHeading.setting.level) {
					currentHeading = currentHeading.parent;
				}

				if (currentHeading.setting.id === root.setting.id) {
					currentHeading = currentHeading.addSettingChild(
						newHeading
					) as HeadingSettingComponent;
				} else {
					currentHeading = currentHeading.parent.addSettingChild(
						newHeading
					) as HeadingSettingComponent;
				}
			} else if (newHeading.level === currentHeading.setting.level) {
				currentHeading = currentHeading.parent.addSettingChild(
					newHeading
				) as HeadingSettingComponent;
			} else {
				currentHeading = currentHeading.addSettingChild(
					newHeading
				) as HeadingSettingComponent;
			}
		} else {
			currentHeading.addSettingChild(setting);
		}
	}

	return root;
}

export class HeadingSettingComponent extends AbstractSettingComponent {
	setting: Heading;
	settingEl: Setting;
	parent: HeadingSettingComponent;
	children: AbstractSettingComponent[] = [];
	filteredChildren: AbstractSettingComponent[] = [];
	filterMode: boolean = false;
	filterResultCount: number = 0;
	resultsEl: HTMLElement;

	render(): void {
		if (!this.containerEl) return;
		const title = getTitle(this.setting);
		const description = getDescription(this.setting);

		this.settingEl = new Setting(this.containerEl);
		this.settingEl.setHeading();
		this.settingEl.setClass('style-settings-heading');
		this.settingEl.setName(title);
		this.settingEl.setDesc(description ?? '');

		this.settingEl.settingEl.dataset.level = this.setting.level.toString();
		this.settingEl.settingEl.dataset.id = this.setting.id;

		const iconContainer = createSpan({
			cls: 'style-settings-collapse-indicator',
		});

		setIcon(iconContainer, 'right-triangle');

		this.settingEl.nameEl.prepend(iconContainer);

		this.resultsEl = this.settingEl.nameEl.createSpan({
			cls: 'style-settings-filter-result-count',
			text: this.filterMode ? `${this.filterResultCount} Results` : undefined,
		});

		this.settingEl.settingEl.addEventListener('click', () => {
			this.toggleVisible();
		});

		this.addResetButton();
		this.addExportButton();

		this.childEl = this.containerEl.createDiv({
			cls: 'style-settings-container',
		});
		this.setCollapsed(!!this.setting.collapsed);
	}

	destroy(): void {
		this.removeChildren();
		this.settingEl?.settingEl.remove();
		this.childEl?.remove();
	}

	filter(filterString: string): number {
		this.filteredChildren = [];
		this.filterResultCount = 0;

		for (const child of this.children) {
			if (child.setting.type === SettingType.HEADING) {
				const childResultCount = (child as HeadingSettingComponent).filter(
					filterString
				);
				if (childResultCount > 0) {
					this.filterResultCount += childResultCount;
					this.filteredChildren.push(child);
				}
			} else {
				if (child.decisiveMatch(filterString)) {
					this.filteredChildren.push(child);
					this.filterResultCount += 1;
				}
			}
		}

		this.filterMode = true;
		if (this.filterResultCount) {
			this.setCollapsed(false);
		} else {
			this.setCollapsed(true);
		}
		this.renderChildren();
		this.resultsEl?.setText(`${this.filterResultCount} Results`);

		return this.filterResultCount;
	}

	clearFilter(): void {
		this.filteredChildren = [];

		for (const child of this.children) {
			if (child.setting.type === SettingType.HEADING) {
				(child as HeadingSettingComponent).clearFilter();
			}
		}

		this.filterMode = false;
		this.setCollapsed(true);
		this.renderChildren();
		this.resultsEl?.empty();
	}

	private renderChildren() {
		this.removeChildren();
		if (this.filterMode) {
			for (const child of this.filteredChildren) {
				this.addChild(child);
			}
		} else {
			for (const child of this.children) {
				this.addChild(child);
			}
		}
	}

	private removeChildren() {
		for (const child of this.children) {
			this.removeChild(child);
		}
	}

	private toggleVisible() {
		this.setCollapsed(!this.setting.collapsed);
	}

	private setCollapsed(collapsed: boolean) {
		this.setting.collapsed = collapsed;
		this.settingEl?.settingEl.toggleClass('is-collapsed', collapsed);

		if (collapsed) {
			this.removeChildren();
		} else {
			this.renderChildren();
		}
	}

	private addResetButton() {
		const { resetFn } = this.setting;
		if (resetFn) {
			this.settingEl.addExtraButton((b) => {
				b.setIcon('reset')
					.setTooltip('Reset all settings to default')
					.onClick(resetFn);
			});
		}
	}

	private addExportButton() {
		this.settingEl.addExtraButton((b) => {
			b.setIcon('install');
			b.setTooltip('Export settings');
			b.extraSettingsEl.onClickEvent((e) => {
				e.stopPropagation();
				let title = getTitle(this.setting);
				title =
					this.sectionName === title ? title : `${this.sectionName} > ${title}`;
				this.settingsManager.export(
					title,
					this.settingsManager.getSettings(
						this.sectionId,
						this.getAllChildrenIds()
					)
				);
			});
		});
	}

	addSettingChild(child: CSSSetting): AbstractSettingComponent | undefined {
		const newSettingComponent = createSettingComponent(
			this,
			this.sectionId,
			this.sectionName,
			child,
			this.settingsManager,
			this.isView
		);
		if (!newSettingComponent) {
			return undefined;
		}

		this.children.push(newSettingComponent);
		return newSettingComponent;
	}

	getAllChildrenIds(): string[] {
		const children: string[] = [];
		for (const child of this.children) {
			children.push(child.setting.id);
			if (child.setting.type === 'heading') {
				children.push(
					...(child as HeadingSettingComponent).getAllChildrenIds()
				);
			}
		}
		return children;
	}
}
