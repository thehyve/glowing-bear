/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';
import {AppConfig} from '../../config/app.config';

@Component({
  selector: 'gb-side-panel',
  templateUrl: './gb-side-panel.component.html',
  styleUrls: ['./gb-side-panel.component.css']
})
export class GbSidePanelComponent implements OnInit {

  constructor(private navbarService: NavbarService,
              private config: AppConfig) {
  }

  ngOnInit() {
  }

  get isDataSelection(): boolean {
    return this.navbarService.isDataSelection;
  }

  get enableQuerySaving(): boolean {
    return this.config.getConfig('enable-query-saving', true);
  }
}
