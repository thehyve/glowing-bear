import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {QueryBuilderComponent} from "./query-builder.component";


const routes: Routes = [
  {path: '', component: QueryBuilderComponent}
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
