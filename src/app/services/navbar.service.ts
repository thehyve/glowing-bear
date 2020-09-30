/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  EPFL LDS
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { QueryService } from './query.service';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class NavbarService {

  private _items: MenuItem[];
  private _activeItem: MenuItem;
  private _selectedSurvivalId: Subject<number>

  private _isExplore = true;
  private _isExploreResults = false;
  private _isAnalysis = false;
  private _isSurvivalRes = new Array<boolean>();



  constructor(private queryService: QueryService) {
    this._selectedSurvivalId = new Subject<number>()
    this.items = [

      // 0: explore tab, default page
      { label: 'Explore', routerLink: '/explore' },

      // 1: explore results tab, not visible by default
      { label: 'Explore Results', routerLink: '/explore/results', visible: false },

      // 2: survival analysis tab
      { label: 'Analysis', routerLink: '/analysis' }
    ];

    // hook to update explore results tab visibility
    this.queryService.displayExploreResultsComponent.subscribe((display) => {
      this.items[1].visible = display;
    })
  }

  updateNavbar(routerLink: string) {
    this.isExplore = (routerLink === '/explore' || routerLink === '');
    this.isExploreResults = (routerLink === '/explore/results');
    this.isAnalysis = (routerLink === '/analysis')
    for (let i = 0; i < this.isSurvivalRes.length; i++) {
      this.isSurvivalRes[i] = (routerLink === `/survival/${i}`)
    }
    console.log(routerLink)

    if (this.isExplore) {
      this.activeItem = this._items[0];
    } else if (this.isExploreResults) {
      this.activeItem = this._items[1];
    } else if (this.isAnalysis) {
      this.activeItem = this._items[2];
    } else {
      for (let i = 0; i < this.isSurvivalRes.length; i++) {
        if (this.isSurvivalRes[i]) {
          this.activeItem = this._items[i + 2]
          this._selectedSurvivalId.next(i)
          break
        }
      }
    }
  }
  insertNewSurvResults() {
    let index = this.isSurvivalRes.push(false) - 1;
    this.items.push({ label: `Survival Result ${index}`, routerLink: `/survival/${index}` });

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

  get isAnalysis(): boolean {
    return this._isAnalysis
  }

  set isAnalysis(value: boolean) {
    this._isAnalysis = value
  }

  set isSurvivalRes(value: boolean[]) {
    this._isSurvivalRes = value
  }
  get isSurvivalRes(): boolean[] {
    return this._isSurvivalRes
  }
  get selectedSurvivalId(): Observable<number> {
    return this._selectedSurvivalId.asObservable()
  }
}
