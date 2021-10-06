/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Injectable()
export class OntologyNavbarService {

  private _items: MenuItem[];
  private _activeItem: MenuItem;

  private _isBrowse = true;
  private _isTermSearch = false;

  constructor() {
    this.items = [
      { label: 'Browse', command: this.setItem.bind(this) },
      { label: 'Term Search', command: this.setItem.bind(this) }
    ]
    
    this.activeItem = this.items[this.isBrowse ? 0 : 1];
  }

  setItem(event: { item: MenuItem }) {
    this.isBrowse = event.item.label === 'Browse';
    this.isTermSearch = event.item.label === 'Term Search';
    this.activeItem = this.items[this.isBrowse ? 0 : 1];
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

  get isBrowse(): boolean {
    return this._isBrowse;
  }

  set isBrowse(value: boolean) {
    this._isBrowse = value;
  }

  get isTermSearch(): boolean {
    return this._isTermSearch;
  }

  set isTermSearch(value: boolean) {
    this._isTermSearch = value;
  }
}
