import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ExportComponent} from "./export.component";


const routes: Routes = [
  {path: '', component: ExportComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
