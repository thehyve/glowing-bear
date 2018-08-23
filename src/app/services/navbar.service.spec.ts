/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {NavbarService} from './navbar.service';
import {QueryService} from './query.service';
import {QueryServiceMock} from './mocks/query.service.mock';
import {ExportService} from './export.service';
import {ExportServiceMock} from './mocks/export.service.mock';
import {of as observableOf} from 'rxjs';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';

describe('NavbarService', () => {
  let queryService: QueryService;
  let navbarService: NavbarService;
  let authService: AuthenticationService;
  let exportService: ExportService;
  let exportEnabled: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
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
    authService = TestBed.get(AuthenticationService);
    queryService = TestBed.get(QueryService);
    exportService = TestBed.get(ExportService);
    exportEnabled = false;
    spyOn(exportService, 'isExportEnabled').and.callFake(() => observableOf(exportEnabled));
    navbarService = TestBed.get(NavbarService);
  });

  it('should be injected', inject([NavbarService], (service: NavbarService) => {
    expect(service).toBeTruthy();
    expect(service.items.length).toBe(2);
  }));

  it('should add export item when access level is full', () => {
    exportEnabled = true;
    navbarService = new NavbarService(authService, exportService, queryService);
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

});
