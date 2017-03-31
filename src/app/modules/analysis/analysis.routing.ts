import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AnalysisComponent} from "./analysis.component";


const routes: Routes = [
  { path: '', component: AnalysisComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
