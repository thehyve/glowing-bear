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
const routes: Routes = [
  {
    path: '',
    redirectTo: '/cohort-selection',
    pathMatch: 'full'
  },
  {
    path: 'cohort-selection',
    loadChildren: () => import('../gb-cohort-selection-module/gb-cohort-selection.module').then(m => m.GbCohortSelectionModule)
  },
  {
    path: 'analysis',
    loadChildren: () => import('../gb-analysis-module/gb-analysis.module').then(m => m.GbAnalysisModule)
  },
  {
    path: 'export',
    loadChildren: () => import('../gb-export-module/gb-export.module').then(m => m.GbExportModule)
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
