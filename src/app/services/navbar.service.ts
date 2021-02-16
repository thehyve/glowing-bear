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
import { QueryService } from './query.service';
import { Subject, Observable } from 'rxjs';
import { OperationType } from 'app/models/operation-models/operation-types';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router'

@Injectable()
export class NavbarService {

  private _items: MenuItem[];
  private _activeItem: MenuItem;
  private _selectedSurvivalId: Subject<number>

  private _isExplore = true;
  private _isExploreResults = false;
  private _isAnalysis = false;
  private _isSurvivalRes = new Array<boolean>();

  private _lastSuccessfulSurvival: number;

  private EXPLORE_INDEX = 0;
  private ANALYSIS_INDEX = 1;

  constructor(private authService: AuthenticationService, private router: Router) {
    this._selectedSurvivalId = new Subject<number>()
    this.items = [

      // 0: explore tab, default page
      { label: OperationType.EXPLORE, routerLink: '/explore' },

      // 1: survival analysis tab
      { label: OperationType.ANALYSIS, routerLink: '/analysis', visible: this.authService.hasAnalysisAuth }
    ];
  }

  updateNavbar(routerLink: string) {
    this.isExplore = (routerLink === '/explore' || routerLink === '');
    this.isAnalysis = (routerLink === '/analysis')
    for (let i = 0; i < this.isSurvivalRes.length; i++) {
      this.isSurvivalRes[i] = (routerLink === `/survival/${i + 1}`)
    }
    console.log('Updated router link: ', routerLink)

    if (this.isExplore) {
      this.activeItem = this._items[this.EXPLORE_INDEX];
    } else if (this.isAnalysis) {
      this.activeItem = this._items[this.ANALYSIS_INDEX];
    } else {
      for (let i = 0; i < this.isSurvivalRes.length; i++) {
        if (this.isSurvivalRes[i]) {
          this.activeItem = this._items[i + this.items.length]
          this._selectedSurvivalId.next(i)
          break
        }
      }
    }
  }

  insertNewSurvResults() {
    let index = this.isSurvivalRes.push(false) - 1;
    this.items.push({ label: `Survival Result ${index + 1}`, routerLink: `/survival/${index + 1}` });
    this._lastSuccessfulSurvival = index + 1;

  }

  navigateToNewResults() {
    this.router.navigateByUrl(`/survival/${this._lastSuccessfulSurvival}`)
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
