import { TestBed } from '@angular/core/testing';
import { CharacterDraftService } from './character-draft.service';
import { Attributes } from '../models/character.models';

const ATTRS: Attributes = { STR: 10, CON: 14, AGL: 12, INT: 15, WIL: 17, CHA: 8 };

describe('CharacterDraftService skills', () => {
  let service: CharacterDraftService;
  const skills = () => service.draft().skills ?? {};

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterDraftService);
    service.setKin('Human');
  });

  it('trains skills at exactly 2× base chance', () => {
    service.setProfession('Scholar');
    service.setAge('Adult');
    service.setAttributes(ATTRS, 'standard');
    service.setTrainedSkills(['Awareness', 'Bartering']);

    expect(skills()['Awareness']).toMatchObject({ level: 12, trained: true });
    expect(skills()['Bartering']).toMatchObject({ level: 8, trained: true });
    expect(skills()['Beast Lore']).toMatchObject({ level: 6, trained: false });
  });

  it('stores a mage school as a trained skill, but only from the skills step', () => {
    service.setProfession('Mage');
    service.setMageSchool('Animism', [], []);
    service.setAge('Adult');
    service.setAttributes(ATTRS, 'standard');

    // Before the skills step nothing may be trained, or the wizard guard skips ahead
    expect(skills()['Animism']).toBeUndefined();

    service.setTrainedSkills(['Awareness']);
    expect(skills()['Animism']).toMatchObject({ level: 14, trained: true });
  });

  it('recomputes levels on new attributes, keeping trained flags and the school', () => {
    service.setProfession('Mage');
    service.setMageSchool('Animism', [], []);
    service.setAge('Adult');
    service.setAttributes(ATTRS, 'standard');
    service.setTrainedSkills(['Awareness']);

    service.setAttributes({ ...ATTRS, INT: 8, WIL: 10 }, 'standard');

    expect(skills()['Awareness']).toMatchObject({ level: 8, trained: true });
    expect(skills()['Animism']).toMatchObject({ level: 10, trained: true });
  });

  it('applies age modifiers to skill levels', () => {
    service.setProfession('Thief');
    service.setAge('Young');
    service.setAttributes(ATTRS, 'standard');
    service.setTrainedSkills(['Acrobatics']);

    // AGL 12 + 1 (Young) = 13 → base chance 6 → trained 12
    expect(skills()['Acrobatics'].level).toBe(12);
  });
});
