/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSummaryComponent} from './gb-summary.component';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {TreeModule} from 'primeng/tree';
import {DragDropModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';

describe('GbSummaryComponent', () => {
  let component: GbSummaryComponent;
  let fixture: ComponentFixture<GbSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSummaryComponent
      ],
      imports: [
        DragDropModule,
        FormsModule,
        TreeModule
      ],
      providers: [
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
