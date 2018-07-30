/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {NavbarService} from './navbar.service';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {QueryService} from './query.service';
import {QueryServiceMock} from './mocks/query.service.mock';
import {AccessLevel} from './authentication/access-level';
import {ExportService} from './export.service';
import {ExportServiceMock} from './mocks/export.service.mock';
import {Observable} from 'rxjs/Observable';
import Spy = jasmine.Spy;

describe('NavbarService', () => {
  let queryService: QueryService;
  let navbarService: NavbarService;
  let exportService: ExportService;
  let exportEnabled: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        },
        NavbarService
      ]
    });
    queryService = TestBed.get(QueryService);
    exportService = TestBed.get(ExportService);
    exportEnabled = false;
    spyOn(exportService, 'isExportEnabled').and.callFake(() => Observable.of(exportEnabled));
    navbarService = TestBed.get(NavbarService);
  });

  it('should be injected', inject([NavbarService], (service: NavbarService) => {
    expect(service).toBeTruthy();
    expect(service.items.length).toBe(2);
  }));

  it('should add export item when access level is full', () => {
    exportEnabled = true;
    navbarService = new NavbarService(exportService, queryService);
    expect(navbarService.items.length).toBe(3);
  });

  it('should update navbar', () => {
    let which = 'others random';
    navbarService.updateNavbar(which);
    expect(navbarService.isDataSelection).toBe(false);
    expect(navbarService.isAnalysis).toBe(false);
    expect(navbarService.isExport).toBe(false);
    expect(navbarService.activeItem).not.toBeDefined();
    which = '';
    navbarService.updateNavbar(which);
    expect(navbarService.isDataSelection).toBe(true);
    expect(navbarService.activeItem).toBe(navbarService.items[0]);
    which = 'data-selection';
    navbarService.updateNavbar(which);
    expect(navbarService.isDataSelection).toBe(true);
    expect(navbarService.activeItem).toBe(navbarService.items[0]);
    which = 'analysis';
    navbarService.updateNavbar(which);
    expect(navbarService.isAnalysis).toBe(true);
    expect(navbarService.activeItem).toBe(navbarService.items[1]);
    which = 'export';
    navbarService.updateNavbar(which);
    expect(navbarService.isExport).toBe(true);
    expect(navbarService.activeItem).toBe(navbarService.items[2]);
  });

  it('should not update data selection when step 1 and 2 are clean', () => {
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callThrough();
    queryService.isDirty_1 = false;
    queryService.isDirty_2 = false;
    navbarService.updateDataSelection()
      .then(() => {
        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });
  });

  it('should update step 1 and 2 when step 1 is dirty', () => {
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callThrough();
    queryService.isDirty_1 = true;
    queryService.isDirty_2 = false;
    navbarService.updateDataSelection()
      .then(() => {
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
      });
  });

  it('should update step 2 when step 2 is dirty', () => {
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callThrough();
    queryService.isDirty_1 = false;
    queryService.isDirty_2 = true;
    navbarService.updateDataSelection()
      .then(() => {
        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
      });
  });

  it('should fail step 1 update when update_1 fails (dirty_1)', () => {
    let error1 = 'error1';
    let error2 = 'error2';
    let spy1 = spyOn(queryService, 'update_1').and.callFake(() => {
      return new Promise<any>((resolve, reject) => {
        reject(error1);
      })
    });
    let spy2 = spyOn(queryService, 'update_2').and.callFake(() => {
      return new Promise<any>((resolve, reject) => {
        reject(error2);
      })
    });
    queryService.isDirty_1 = true;
    queryService.isDirty_2 = false;
    navbarService.updateDataSelection()
      .then(() => {
      })
      .catch(err => {
        expect(err).toEqual(error1);
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      })
  });

  it('should fail step 2 update when update_2 fails (dirty_1)', () => {
    let error1 = 'error1';
    let error2 = 'error2';
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callFake(() => {
      return new Promise<any>((resolve, reject) => {
        reject(error2);
      })
    });
    queryService.isDirty_1 = true;
    queryService.isDirty_2 = false;
    navbarService.updateDataSelection()
      .then(() => {
      })
      .catch(err => {
        expect(err).toEqual(error2);
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
      })
  });

  it('should fail step 2 update when update_2 fails (dirty_2)', () => {
    let error2 = 'error2';
    let spy1 = spyOn(queryService, 'update_1').and.callThrough();
    let spy2 = spyOn(queryService, 'update_2').and.callFake(() => {
      return new Promise<any>((resolve, reject) => {
        reject(error2);
      })
    });
    queryService.isDirty_1 = false;
    queryService.isDirty_2 = true;
    navbarService.updateDataSelection()
      .then(() => {
      })
      .catch(err => {
        expect(err).toEqual(error2);
        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
      })
  });

});
