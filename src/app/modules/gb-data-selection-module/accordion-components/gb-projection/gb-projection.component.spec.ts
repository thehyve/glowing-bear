/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbProjectionComponent} from './gb-projection.component';
import {TreeModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {QueryService} from '../../../../services/query.service';

describe('GbProjectionComponent', () => {
  let component: GbProjectionComponent;
  let fixture: ComponentFixture<GbProjectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbProjectionComponent
      ],
      imports: [
        TreeModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
