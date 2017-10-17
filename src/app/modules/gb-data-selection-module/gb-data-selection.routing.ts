import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbDataSelectionComponent} from "./gb-data-selection.component";


const routes: Routes = [
  {
    path: '',
    component: GbDataSelectionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
