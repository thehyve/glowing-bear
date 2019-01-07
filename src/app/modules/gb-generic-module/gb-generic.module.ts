/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {NgModule} from '@angular/core';
import {GbLoadingComponent} from './gb-loading/gb-loading.component';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [GbLoadingComponent],
  exports: [GbLoadingComponent]
})
export class GbGenericModule {
}
