import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbMainComponent} from './modules/gb-main-module/gb-main.component';

// Route Configuration
export const routes: Routes = [
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'main', component: GbMainComponent},
  {path: '**', component: GbMainComponent}];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
