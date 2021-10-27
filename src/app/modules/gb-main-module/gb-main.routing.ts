/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbResultsComponent} from '../gb-results-module/gb-results.component';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/explore',
    pathMatch: 'full'
  },
  {
    path: 'explore',
    loadChildren: () => import('../gb-explore-module/gb-explore.module').then(m => m.GbExploreModule)
  },
  {
    path: 'analysis',
    loadChildren: () => import('../gb-analysis-module/gb-analysis.module').then(m => m.GbAnalysisModule)
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
  },
  { // https://stackoverflow.com/questions/61084536/how-to-redirect-unknown-routes-to-home-route-in-angular-program
    path: '**', redirectTo: '/explore'
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
