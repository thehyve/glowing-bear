/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataTableComponent} from './gb-data-table.component';
import {MockComponent} from 'ng2-mock-component';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';
import {DataTableService} from '../../../../services/data-table.service';
import {GbGenericModule} from '../../../gb-generic-module/gb-generic.module';

describe('GbDataTableComponent', () => {
  let component: GbDataTableComponent;
  let fixture: ComponentFixture<GbDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDataTableComponent,
        MockComponent({selector: 'gb-data-table-dimensions'}),
        MockComponent({selector: 'gb-data-table-grid'})
      ],
      imports: [
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
    fixture = TestBed.createComponent(GbDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
