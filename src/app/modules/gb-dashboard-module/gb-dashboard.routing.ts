import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbDashboardComponent} from './gb-dashboard.component';


const routes: Routes = [
  {path: '', component: GbDashboardComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
