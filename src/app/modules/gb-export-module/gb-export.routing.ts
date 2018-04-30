import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbExportComponent} from './gb-export.component';


const routes: Routes = [
  {
    path: '',
    component: GbExportComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
