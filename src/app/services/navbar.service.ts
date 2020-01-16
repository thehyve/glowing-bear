/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {AuthenticationService} from './authentication/authentication.service';
import {QueryService} from './query.service';
import {MessageHelper} from '../utilities/message-helper';
import {AppConfig} from '../config/app.config';

@Injectable()
export class NavbarService {

  // todo: get in there the medco result thing

  private _items: MenuItem[];
  private _activeItem: MenuItem;

  private _isExplore = true;
  private _isExploreResults = false;

  constructor() {
    this.items = [
      {label: 'Explore', routerLink: '/explore'},
      {label: 'Explore Results', routerLink: '/explore/results'},
    ];
  }

  updateNavbar(routerLink: string) {
    this.isExplore = (routerLink === '/explore' || routerLink === '');
    this.isExploreResults = (routerLink === '/explore/results');

    if (this.isExplore) {
      this.activeItem = this._items[0];
    } else if (this.isExploreResults) {
      this.activeItem = this._items[1];
    }
  }

  get items(): MenuItem[] {
    return this._items;
  }

  set items(value: MenuItem[]) {
    this._items = value;
  }

  get activeItem(): MenuItem {
    return this._activeItem;
  }

  set activeItem(value: MenuItem) {
    this._activeItem = value;
  }

  get isExplore(): boolean {
    return this._isExplore;
  }

  set isExplore(value: boolean) {
    this._isExplore = value;
  }

  get isExploreResults(): boolean {
    return this._isExploreResults;
  }

  set isExploreResults(value: boolean) {
    this._isExploreResults = value;
  }
}
