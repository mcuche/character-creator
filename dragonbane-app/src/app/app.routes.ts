import { Routes } from '@angular/router';
import { wizardGuard } from './shared/wizard.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./features/wizard/wizard.component').then(m => m.WizardComponent),
    children: [
      { path: '', redirectTo: 'kin', pathMatch: 'full' },
      { path: 'kin', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/kin/kin.component').then(m => m.KinComponent) },
      { path: 'profession', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/profession/profession.component').then(m => m.ProfessionComponent) },
      { path: 'mage-school', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/mage-school/mage-school.component').then(m => m.MageSchoolComponent) },
      { path: 'age', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/age/age.component').then(m => m.AgeComponent) },
      { path: 'attributes', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/attributes/attributes.component').then(m => m.AttributesComponent) },
      { path: 'derived', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/derived/derived.component').then(m => m.DerivedComponent) },
      { path: 'skills', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/skills/skills.component').then(m => m.SkillsComponent) },
      { path: 'weakness', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/weakness/weakness.component').then(m => m.WeaknessComponent) },
      { path: 'gear', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/gear/gear.component').then(m => m.GearComponent) },
      { path: 'memento', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/memento/memento.component').then(m => m.MementoComponent) },
      { path: 'appearance', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/appearance/appearance.component').then(m => m.AppearanceComponent) },
      { path: 'summary', canActivate: [wizardGuard], loadComponent: () => import('./features/wizard/steps/summary/summary.component').then(m => m.SummaryComponent) },
    ],
  },
  {
    path: 'character/:id',
    loadComponent: () => import('./features/character-sheet/character-sheet.component').then(m => m.CharacterSheetComponent),
  },
  { path: '**', redirectTo: '' },
];
