import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: './modules/dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'data-selection',
    loadChildren: './modules/data-selection/data-selection.module#DataSelectionModule'
  },
  {
    path: 'analysis',
    loadChildren: './modules/analysis/analysis.module#AnalysisModule'
  },
  {
    path: 'export',
    loadChildren: './modules/export/export.module#ExportModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
