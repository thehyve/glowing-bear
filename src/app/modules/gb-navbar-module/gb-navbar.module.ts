/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbNavbarComponent} from './gb-navbar.component';
import {RouterModule} from '@angular/router';
import {TabMenuModule} from 'primeng/components/tabmenu/tabmenu';
import {FormsModule} from '@angular/forms';
import {MessagesModule} from 'primeng/messages';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TabMenuModule,
    FormsModule,
    MessagesModule
  ],
  declarations: [GbNavbarComponent],
  exports: [GbNavbarComponent]
})
export class GbNavBarModule {
}
