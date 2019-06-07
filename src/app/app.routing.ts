/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GbMainComponent} from './modules/gb-main-module/gb-main.component';

// Route Configuration
export const routes: Routes = [
  {path: '', redirectTo: 'main/cohort-selection', pathMatch: 'full'},
  {path: 'main', component: GbMainComponent},
  {path: '**', redirectTo: '/cohort-selection'}];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
