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

  private _resultItems : MenuItem[];
  private _activeResultItem: MenuItem;

  private _isExplore = true;
  private _isExploreResults = false;
  private _isAnalysis = false;
  private _isResults = false;
  private _isSurvivalRes = new Array<boolean>();

  private _lastSuccessfulSurvival: number;

  private EXPLORE_INDEX = 0;
  private ANALYSIS_INDEX = 1;
  private RESULTS_INDEX = 2;

  constructor(private authService: AuthenticationService, private router: Router) {
    this._selectedSurvivalId = new Subject<number>()
    this.items = [

      // 0: explore tab, default page
      { label: OperationType.EXPLORE, routerLink: '/explore' },

      // 1: survival analysis tab
      { label: OperationType.ANALYSIS, routerLink: '/analysis', visible: this.authService.hasAnalysisAuth },

      // 2: results tab
      { label: "Results", routerLink: '/results', visible: this.authService.hasAnalysisAuth }
    ]

    this.resultItems = []
  }

  updateNavbar(routerLink: string) {
    this.isExplore = (routerLink === '/explore' || routerLink === '');
    this.isAnalysis = (routerLink === '/analysis');
    this.isResults = (routerLink === '/results');
    for (let i = 0; i < this.isSurvivalRes.length; i++) {
      this.isSurvivalRes[i] = (routerLink === `/results/survival/${i + 1}`)
    }
    console.log('Updated router link: ', routerLink)

    if (this.isExplore) {
      this.activeItem = this.items[this.EXPLORE_INDEX];
    } else if (this.isAnalysis) {
      this.activeItem = this.items[this.ANALYSIS_INDEX];
    } else if (this.isResults){
      this.activeItem = this.items[this.RESULTS_INDEX];
    } else {
      for (let i = 0; i < this.isSurvivalRes.length; i++) {
        if (this.isSurvivalRes[i]) {
          this.activeItem = this.items[this.RESULTS_INDEX]
          this.activeResultItem = this.resultItems[i]
          this._selectedSurvivalId.next(i)
          break
        }
      }
    }
  }

  insertNewSurvResults() {
    let index = this.isSurvivalRes.push(false) - 1;
    this.resultItems.push({ label: `Survival Result ${index + 1}`, routerLink: `/results/survival/${index + 1}` })
    this._lastSuccessfulSurvival = index + 1;
  }

  deleteSrvResult() {
    let index = this.resultItems.indexOf(this.activeResultItem)
    this.resultItems = this.resultItems.filter(obj => obj !== this.activeResultItem);
    console.log("index ", index, "length ", this.resultItems.length)
    if (this.resultItems.length === 0){
      this.router.navigateByUrl(`/results`)
    } else if (this.resultItems.length != index){
      this.activeResultItem = this.resultItems[index]
      this.router.navigateByUrl(`/results/survival/${index + 1}`)
    } else {
      this.activeResultItem = this.resultItems[index - 1]
      this.router.navigateByUrl(`/results/survival/${index}`)
    }
  }

  navigateToNewResults() {
    this.router.navigateByUrl(`/results/survival/${this._lastSuccessfulSurvival}`)
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

  get resultItems(): MenuItem[] {
    return this._resultItems;
  }

  set resultItems(value: MenuItem[]) {
    this._resultItems = value;
  }

  get activeResultItem(): MenuItem {
    return this._activeResultItem;
  }

  set activeResultItem(value: MenuItem) {
    this._activeResultItem = value;
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

  get isResults(): boolean {
    return this._isResults;
  }

  set isResults(value: boolean) {
    this._isResults = value;
  }

}
