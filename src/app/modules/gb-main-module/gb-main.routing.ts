/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/explore',
    pathMatch: 'full'
  },
  {
    path: 'explore',
    loadChildren: '../gb-explore-module/gb-explore.module#GbExploreModule'
  },
  {
    path: 'explore/results',
    loadChildren: '../gb-explore-results-module/gb-explore-results.module#GbExploreResultsModule'
  },
  {
    path: 'survival',
    loadChildren:'../gb-survival-module/gb-survival.module#GbSurvivalModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
