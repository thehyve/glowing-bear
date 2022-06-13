/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbDataTableGridComponent} from './gb-data-table-grid.component';
import {DataTableService} from '../../../../services/data-table.service';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng';
import {GbGenericModule} from '../../../gb-generic-module/gb-generic.module';

describe('GbDataTableGridComponent', () => {
  let component: GbDataTableGridComponent;
  let fixture: ComponentFixture<GbDataTableGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GbDataTableGridComponent],
      imports: [
        TableModule,
        TooltipModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDataTableGridComponent);
    component = fixture.componentInstance;
  });

  it('should be created.', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
  });
});
