/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';
import {MenuItem} from 'primeng/api';
import {AppConfig} from '../../config/app.config';
import {CompatibilityHelper} from '../../utilities/compatibility-helper';

@Component({
  selector: 'gb-nav-bar',
  templateUrl: './gb-navbar.component.html',
  styleUrls: ['./gb-navbar.component.css']
})
export class GbNavbarComponent implements OnInit {
  docUrl: string;
  appVersion: string;

  constructor(private appConfig: AppConfig,
              private navbarService: NavbarService) {
    this.docUrl = appConfig.getConfig('doc-url');
    this.appVersion = appConfig.version;
  }

  ngOnInit() {
  }

  logout() {
    this.navbarService.logout();
  }

  get msie(): boolean {
    return CompatibilityHelper.isMSIE();
  }

  get items(): MenuItem[] {
    return this.navbarService.items;
  }

  get activeItem(): MenuItem {
    return this.navbarService.activeItem;
  }

}
