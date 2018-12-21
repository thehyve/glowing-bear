/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataTableDimensionsComponent} from './gb-data-table-dimensions.component';
import {DataTableService} from '../../../../services/data-table.service';
import {CheckboxModule, PickListModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';

describe('GbDataTableDimensionsComponent', () => {
  let component: GbDataTableDimensionsComponent;
  let fixture: ComponentFixture<GbDataTableDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbDataTableDimensionsComponent],
      imports: [
        PickListModule,
        CheckboxModule,
        FormsModule,
        BrowserModule
      ],
      providers: [
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: CohortService,
          useClass: CohortServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDataTableDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
