/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbResultsComponent} from "../gb-results-module/gb-results.component";

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
    path: 'analysis',
    loadChildren: '../gb-analysis-module/gb-analysis.module#GbAnalysisModule'
  },
  {
    path: 'results',
    component: GbResultsComponent,
    children: [
      {
        path: 'survival/:id',
        loadChildren: '../gb-survival-results-module/gb-survival-results.module#GbSurvivalResultsModule'
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
