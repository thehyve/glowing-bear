/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCrossTableComponent} from './gb-cross-table.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../../services/cross-table.service';
import {TableModule} from 'primeng/table';
import {CrossTableServiceMock} from '../../../../services/mocks/cross-table.service.mock';
import {OverlayPanelModule} from 'primeng';
import {GbGenericModule} from '../../../gb-generic-module/gb-generic.module';

describe('GbCrossTableComponent', () => {
  let component: GbCrossTableComponent;
  let fixture: ComponentFixture<GbCrossTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TableModule,
        OverlayPanelModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        }
      ],
      declarations: [
        GbCrossTableComponent,
        MockComponent({selector: 'gb-droppable-zone', inputs: ['constraints', 'axis', 'disabled']})
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCrossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
