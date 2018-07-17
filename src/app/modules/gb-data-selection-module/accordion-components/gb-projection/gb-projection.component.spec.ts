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
  let queryService: QueryService;
  let treeNodeService: TreeNodeService;

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
    queryService = TestBed.get(QueryService);
    treeNodeService = TestBed.get(TreeNodeService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should update step 2 when instant update flag is on', () => {
    queryService.instantCountsUpdate_2 = true;
    let spy1 = spyOn(queryService, 'update_2').and.stub();
    component.updateCounts();
    expect(spy1).toHaveBeenCalled();
  });

  it('should set dirty_2 when isntant update flag if off', () => {
    queryService.instantCountsUpdate_2 = false;
    let spy1 = spyOn(queryService, 'update_2').and.stub();
    component.updateCounts();
    expect(spy1).not.toHaveBeenCalled();
    expect(queryService.isDirty_2).toBe(true);
  });

  it('should import projection criteria', () => {
    let uploadElm = document.createElement('a');
    spyOn(document, 'getElementById').and.returnValue(uploadElm);
    let spy1 = spyOn(uploadElm, 'click').and.stub();
    component.isUploadListenerNotAdded = true;
    component.importCriteria();
    expect(component.isUploadListenerNotAdded).toBe(false);
    expect(spy1).toHaveBeenCalled();
  });

});
