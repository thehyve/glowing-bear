/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {QueryService} from './query.service';
import {MessageHelper} from '../utilities/message-helper';
import {ExportService} from './export.service';

@Injectable()
export class NavbarService {

  private _items: MenuItem[];
  private _activeItem: MenuItem;

  private _isDataSelection = true;
  private _isAnalysis = false;
  private _isExport = false;


  constructor(private exportService: ExportService,
              private queryService: QueryService) {
    this.items = [
      {label: 'Data Selection', routerLink: '/data-selection'},
      {label: 'Analysis', routerLink: '/analysis'}
    ];
    this.exportService.isExportEnabled().subscribe((exportEnabled) => {
      if (exportEnabled) {
        this.items.push({label: 'Export', routerLink: '/export'});
      }
    });
  }

  updateNavbar(whichStep: string) {
    this.isDataSelection = (whichStep === 'data-selection' || whichStep === '');
    this.isAnalysis = (whichStep === 'analysis');
    this.isExport = (whichStep === 'export');

    if (this.isDataSelection) {
      this.activeItem = this._items[0];
    } else if (this.isAnalysis) {
      this.activeItem = this._items[1];
    } else if (this.isExport) {
      this.updateDataSelection();
      this.activeItem = this._items[2];
    }
  }

  updateDataSelection(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const errorMessage = 'Fail to update data selection.';
      if (this.queryService.isDirty_1) {
        this.queryService.update_1()
          .then(() => {
            this.queryService.update_2()
              .then(() => {
                this.queryService.update_3()
                  .then(() => {
                    // update the export variables
                    this.exportService.updateExports();
                    resolve(true);
                  })
                  .catch(err => {
                    console.error(errorMessage);
                    MessageHelper.alert('error', errorMessage);
                    reject(err);
                  })
              })
              .catch(err => {
                console.error(errorMessage);
                MessageHelper.alert('error', errorMessage);
                reject(err);
              });
          })
          .catch(err => {
            console.error(errorMessage);
            MessageHelper.alert('error', errorMessage);
            reject(err);
          });
      } else if (this.queryService.isDirty_2) {
        this.queryService.update_2()
          .then(() => {
            this.queryService.update_3()
              .then(() => {
                resolve(true);
              })
              .catch(err => {
                console.error(errorMessage);
                MessageHelper.alert('error', errorMessage);
                reject(err);
              })
          })
          .catch(err => {
            console.error(errorMessage);
            MessageHelper.alert('error', errorMessage);
            reject(err);
          });
      } else if (this.queryService.isDirty_3) {
        this.queryService.update_3()
          .then(() => {
            resolve(true);
          })
          .catch(err => {
            console.error(errorMessage);
            MessageHelper.alert('error', errorMessage);
            reject(err);
          })
      }
    });
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

  get isDataSelection(): boolean {
    return this._isDataSelection;
  }

  set isDataSelection(value: boolean) {
    this._isDataSelection = value;
  }

  get isAnalysis(): boolean {
    return this._isAnalysis;
  }

  set isAnalysis(value: boolean) {
    this._isAnalysis = value;
  }

  get isExport(): boolean {
    return this._isExport;
  }

  set isExport(value: boolean) {
    this._isExport = value;
  }
}
