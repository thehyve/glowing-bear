/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';

import {NavbarService} from './navbar.service';
import {ExportService} from './export.service';
import {ExportServiceMock} from './mocks/export.service.mock';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthenticationServiceMock} from './mocks/authentication.service.mock';
import {FractalisService} from './fractalis.service';
import {FractalisServiceMock} from './mocks/fractalis.service.mock';

describe('NavbarService', () => {
  let navbarService: NavbarService;
  let exportService: ExportService;
  let authService: AuthenticationService;
  let fractalisService: FractalisService;
  let exportEnabled: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        },
        {
          provide: ExportService,
          useClass: ExportServiceMock
        },
        NavbarService
      ]
    });
    exportService = TestBed.inject(ExportService);
    authService = TestBed.inject(AuthenticationService);
    fractalisService = TestBed.inject(FractalisService);
    exportEnabled = false;
    navbarService = TestBed.inject(NavbarService);
  });

  it('should be injected', inject([NavbarService], (service: NavbarService) => {
    expect(service).toBeTruthy();
    expect(service.items.length).toBe(3);
  }));

  it('should add export item when access level is full', () => {
    exportEnabled = true;
    navbarService = new NavbarService(authService, fractalisService, exportService);
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
    which = 'cohort-selection';
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


  it('should update data table if TransmartDataTable export', () => {
    let spyTransmartDataTable = spyOnProperty(exportService, 'isTransmartDataTable', 'get')
      .and.returnValue(false);
    let spy = spyOn(exportService, 'updateDataTableExportFormats').and.stub();
    let which = 'export';
    navbarService.updateNavbar(which);
    expect(spy).not.toHaveBeenCalled();

    spyTransmartDataTable.and.returnValue( true);
    navbarService.updateNavbar(which);
    expect(spy).toHaveBeenCalled();
  })

});
