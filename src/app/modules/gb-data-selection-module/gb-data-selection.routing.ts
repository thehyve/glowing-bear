/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {GbDataSelectionComponent} from './gb-data-selection.component';


const routes: Routes = [
  {
    path: '',
    component: GbDataSelectionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);