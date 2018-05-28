import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbAutoLoginComponent} from './gb-auto-login.component';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/data-selection',
    pathMatch: 'full'
  },
  {
    path: 'data-selection',
    loadChildren: './modules/gb-data-selection-module/gb-data-selection.module#GbDataSelectionModule'
  },
  {
    path: 'analysis',
    loadChildren: './modules/gb-analysis-module/gb-analysis.module#GbAnalysisModule'
  },
  {
    path: 'export',
    loadChildren: './modules/gb-export-module/gb-export.module#GbExportModule'
  },
  {
    path: 'autologin',
    component: GbAutoLoginComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
