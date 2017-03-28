import {ModuleWithProviders}  from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DataSelectionComponent} from "./data-selection/data-selection.component";
import {AnalysisComponent} from "./analysis/analysis.component";
import {ExportComponent} from "./export/export.component";

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'data-selection',
    component: DataSelectionComponent
  },
  {
    path: 'analysis',
    component: AnalysisComponent
  },
  {
    path: 'export',
    component: ExportComponent
  },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
