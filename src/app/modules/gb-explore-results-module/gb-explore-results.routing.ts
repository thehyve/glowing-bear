/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbExploreResultsComponent} from './gb-explore-results.component';
import {GbExploreResultsGuard} from './gb-explore-results.guard';


const routes: Routes = [
  {
    path: '',
    component: GbExploreResultsComponent,
    canActivate: [GbExploreResultsGuard]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
