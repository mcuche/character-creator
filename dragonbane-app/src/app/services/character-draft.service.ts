import { Injectable, signal } from '@angular/core';
import { CharacterDraft, Kin, Profession, Age, MagicSchool, Attributes, SkillEntry, GearItem, Memento, Appearance, Character, Condition } from '../models/character.models';
import { deriveStats, computeSkills } from './character-rules.service';
import { PROFESSION_DATA } from '../data/professions.data';
import { WIZARD_STEPS } from '../shared/wizard-steps';
import { normalizeGear } from '../data/gear.data';

function stepIndex(path: string): number {
  return WIZARD_STEPS.findIndex(s => s.path === path);
}

const DRAFT_KEY = 'dragonbane_draft';

@Injectable({ providedIn: 'root' })
export class CharacterDraftService {
  private _draft = signal<CharacterDraft>(this.load());

  readonly draft = this._draft.asReadonly();

  private load(): CharacterDraft {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return this.empty();
      const draft: CharacterDraft = JSON.parse(raw);
      return draft.gear ? { ...draft, gear: normalizeGear(draft.gear) } : draft;
    } catch {
      return this.empty();
    }
  }

  private empty(): CharacterDraft {
    return {
      id: crypto.randomUUID(),
      name: '',
      skills: {},
      heroicAbilities: [],
      gear: [],
      preparedSpells: [],
      magicTricks: [],
      conditions: [],
      currentHP: 0,
      currentWP: 0,
      appearance: {},
    };
  }

  private persist(draft: CharacterDraft): void {
    this._draft.set(draft);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  patch(partial: Partial<CharacterDraft>): void {
    this.persist({ ...this._draft(), ...partial });
  }

  setName(name: string): void {
    this.patch({ name });
  }

  private clampFurthest(maxPath: string): string {
    const current = this._draft().wizardFurthestStep;
    if (!current) return maxPath;
    return stepIndex(current) <= stepIndex(maxPath) ? current : maxPath;
  }

  advanceHighWaterMark(path: string): void {
    const current = this._draft().wizardFurthestStep;
    const currentIdx = current ? stepIndex(current) : -1;
    if (stepIndex(path) > currentIdx) {
      this.patch({ wizardFurthestStep: path });
    }
  }

  setKin(kin: Kin): void {
    // Kin only resets innate ability — no downstream cascade
    this.patch({ kin });
  }

  setProfession(profession: Profession): void {
    // Changing profession resets heroic ability and profession skill selections
    // We keep free picks by preserving skills not from any profession list
    const currentSkills = this._draft().skills ?? {};
    const profData = PROFESSION_DATA.find(p => p.name === profession);
    const professionSkillNames = profData?.skills ?? [];

    // Remove skills that were profession picks (reset them to untrained baseline)
    const resetSkills: Record<string, SkillEntry> = {};
    for (const [name, entry] of Object.entries(currentSkills)) {
      if (!professionSkillNames.includes(name) && entry.trained) {
        // Keep as a free pick — only remove old profession picks
        resetSkills[name] = entry;
      }
    }

    const heroicAbilities = profession === 'Mage' ? [] : (profData ? [profData.heroicAbilityName] : []);

    this.persist({
      ...this._draft(),
      profession,
      heroicAbilities,
      magicSchool: undefined,
      preparedSpells: [],
      magicTricks: [],
      skills: resetSkills,
      wizardFurthestStep: this.clampFurthest('profession'),
    });
  }

  setMageSchool(school: MagicSchool, spells: string[], tricks: string[]): void {
    this.patch({
      magicSchool: school,
      preparedSpells: spells,
      magicTricks: tricks,
    });
  }

  setAge(age: Age): void {
    // Changing age invalidates attributes (modifiers change) and skill slot counts
    this.persist({
      ...this._draft(),
      age,
      attributes: undefined,
      skills: {},
      attributeGenerationMethod: undefined,
      pointBuyRemaining: undefined,
      wizardFurthestStep: this.clampFurthest('age'),
    });
  }

  setAttributes(attributes: Attributes, method: 'roll' | 'pointbuy' | 'standard'): void {
    const { age, kin, magicSchool } = this._draft();
    const derived = deriveStats(attributes, kin, age);

    // Recompute all skill levels, preserving trained flags. The school entry is
    // only kept if the skills step already added it — the wizard guard treats
    // any trained skill as "skills step done".
    const currentSkills = this._draft().skills ?? {};
    const trainedNames = Object.values(currentSkills).filter(s => s.trained).map(s => s.name);
    const keepSchool = magicSchool && currentSkills[magicSchool] ? magicSchool : undefined;
    const updatedSkills = this.withAdvancementMarks(computeSkills(attributes, age, trainedNames, keepSchool));

    this.persist({
      ...this._draft(),
      attributes,
      derivedStats: derived,
      skills: updatedSkills,
      currentHP: derived.hp,
      currentWP: derived.wp,
      attributeGenerationMethod: method,
      wizardFurthestStep: this.clampFurthest('attributes'),
    });
  }

  setTrainedSkills(trainedSkillNames: string[]): void {
    const { attributes, age, magicSchool } = this._draft();
    if (!attributes) return;

    const school = this._draft().profession === 'Mage' ? magicSchool : undefined;
    const skills = this.withAdvancementMarks(computeSkills(attributes, age, trainedSkillNames, school));
    this.patch({ skills });
  }

  private withAdvancementMarks(skills: Record<string, SkillEntry>): Record<string, SkillEntry> {
    const current = this._draft().skills ?? {};
    for (const [name, entry] of Object.entries(skills)) {
      entry.advancementMarks = current[name]?.advancementMarks ?? 0;
    }
    return skills;
  }

  setWeakness(weakness: string | undefined): void {
    this.patch({ weakness });
  }

  setGear(gear: GearItem[]): void {
    this.patch({ gear });
  }

  setMemento(memento: Memento | undefined): void {
    this.patch({ memento });
  }

  setAppearance(appearance: Appearance): void {
    this.patch({ appearance });
  }

  toCharacter(): Character {
    const d = this._draft();
    return {
      id: d.id ?? crypto.randomUUID(),
      name: d.name ?? '',
      kin: d.kin,
      profession: d.profession,
      age: d.age,
      attributes: d.attributes,
      derivedStats: d.derivedStats,
      skills: d.skills ?? {},
      heroicAbilities: d.heroicAbilities ?? [],
      innateAbility: d.kin,
      weakness: d.weakness,
      gear: d.gear ?? [],
      memento: d.memento,
      appearance: d.appearance ?? {},
      currentHP: d.currentHP ?? 0,
      currentWP: d.currentWP ?? 0,
      conditions: d.conditions ?? [],
      magicSchool: d.magicSchool,
      preparedSpells: d.preparedSpells ?? [],
      magicTricks: d.magicTricks ?? [],
      gold: d.gold ?? 0,
      silver: d.silver ?? 0,
      copper: d.copper ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  reset(): void {
    localStorage.removeItem(DRAFT_KEY);
    this._draft.set(this.empty());
  }
}
