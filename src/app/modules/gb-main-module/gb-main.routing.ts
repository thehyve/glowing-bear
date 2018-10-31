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
    redirectTo: '/cohort-selection',
    pathMatch: 'full'
  },
  {
    path: 'cohort-selection',
    loadChildren: '../gb-cohort-selection-module/gb-cohort-selection.module#GbCohortSelectionModule'
  },
  {
    path: 'analysis',
    loadChildren: '../gb-analysis-module/gb-analysis.module#GbAnalysisModule'
  },
  {
    path: 'export',
    loadChildren: '../gb-export-module/gb-export.module#GbExportModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
