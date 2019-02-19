/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {NavbarService} from '../../services/navbar.service';
import {AppConfig} from '../../config/app.config';
import {TreeNodeService} from '../../services/tree-node.service';

@Component({
  selector: 'gb-side-panel',
  templateUrl: './gb-side-panel.component.html',
  styleUrls: ['./gb-side-panel.component.css']
})
export class GbSidePanelComponent implements OnInit {

  docUrl: string;

  constructor(private appConfig: AppConfig,
              private navbarService: NavbarService) {
    this.docUrl = appConfig.getConfig('doc-url');
  }

  ngOnInit() {
  }

  get isDataSelection(): boolean {
    return this.navbarService.isDataSelection;
  }

  goToDocUrl() {
    window.open(this.docUrl);
  }
}
