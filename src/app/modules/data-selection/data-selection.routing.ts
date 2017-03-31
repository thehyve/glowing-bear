import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DataSelectionComponent} from "./data-selection.component";


const routes: Routes = [
  {path: '', component: DataSelectionComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
