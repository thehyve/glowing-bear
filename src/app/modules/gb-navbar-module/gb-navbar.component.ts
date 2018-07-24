/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {MenuItem} from 'primeng/components/common/api';
import {QueryService} from '../../services/query.service';
import {NavbarService} from '../../services/navbar.service';
import {MessageHelper} from '../../utilities/message-helper';

@Component({
  selector: 'gb-nav-bar',
  templateUrl: './gb-navbar.component.html',
  styleUrls: ['./gb-navbar.component.css']
})
export class GbNavbarComponent implements OnInit {

  public queryName: string;

  constructor(private router: Router,
              private navbarService: NavbarService,
              private queryService: QueryService) {
    this.queryName = '';
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.navbarService.updateNavbar(whichStep);
      }
    });
  }

  get items(): MenuItem[] {
    return this.navbarService.items;
  }

  set items(value: MenuItem[]) {
    this.navbarService.items = value;
  }

  get activeItem(): MenuItem {
    return this.navbarService.activeItem;
  }

  set activeItem(value: MenuItem) {
    this.navbarService.activeItem = value;
  }

  get isDataSelection(): boolean {
    return this.navbarService.isDataSelection;
  }

  /**
   * Prevent the default behavior of node drop
   * @param event
   */
  preventNodeDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  saveQuery() {
    let name = this.queryName ? this.queryName.trim() : '';
    let queryNameIsValid = name !== '';
    if (queryNameIsValid) {
      this.queryService.saveQueryByName(name);
      this.queryName = '';
    } else {
      MessageHelper.alert('error', 'Please specify the query name.', '');
    }
  }

  clearAllCriteria() {
    this.queryService.clearAll();
  }

  get isSavingQueryCompleted(): boolean {
    return this.queryService.isSavingQueryCompleted;
  }
}

