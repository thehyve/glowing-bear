import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbAnalysisComponent} from './gb-analysis.component';


const routes: Routes = [
  {
    path: '',
    component: GbAnalysisComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
