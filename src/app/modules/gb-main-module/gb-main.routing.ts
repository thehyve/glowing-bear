import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/data-selection',
    pathMatch: 'full'
  },
  {
    path: 'data-selection',
    loadChildren: '../gb-data-selection-module/gb-data-selection.module#GbDataSelectionModule'
  },
  {
    path: 'analysis',
    loadChildren: '../gb-analysis-module/gb-analysis.module#GbAnalysisModule'
  },
  {
    path: 'export',
    loadChildren: '../gb-export-module/gb-export.module#GbExportModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
