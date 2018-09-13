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
import {DragDropModule, TreeNode} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CrossTableService} from '../../../../services/cross-table.service';
import {CrossTableServiceMock} from '../../../../services/mocks/cross-table.service.mock';

describe('GbSummaryComponent', () => {
  let component: GbSummaryComponent;
  let fixture: ComponentFixture<GbSummaryComponent>;
  let queryService: QueryService;
  let crossTableService: CrossTableService;

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
        },
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    queryService = TestBed.get(QueryService);
    crossTableService = TestBed.get(CrossTableService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should invoke clear functions in query and crossTable services', () => {
    let promise = new Promise<any>(resolve => {
      resolve(true);
    });
    let spy1 = spyOn(queryService, 'clearAll').and.returnValue(promise);
    let spy2 = spyOn(crossTableService, 'clear').and.callThrough();
    component.clearAll();
    promise.then(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  it('should update event listeners', () => {
    let node: TreeNode = {};
    node['name'] = 'test-tree-node';
    node['type'] = 'NUMERIC';
    let nodeEl = document.createElement('div');
    let treeNodeEl = document.createElement('div');
    let spy = spyOn(fixture.nativeElement, 'querySelector')
      .and.callFake((param) => {
        if (param === '.ui-tree-container') {
          return {
            children: [nodeEl]
          }
        } else if (param === '.ui-treenode-children') {
          let child: TreeNode = {};
          child['name'] = 'test-tree-node-child';
          child['type'] = 'CATEGORICAL';
          return [child];
        } else if (param === 'li.ui-treenode') {
          return nodeEl;
        }
      });
    let spy1 = spyOn(component, 'updateEventListeners').and.callThrough();
    let spy2 = spyOnProperty(component, 'finalTreeNodes', 'get').and.returnValue([node]);
    let spy3 = spyOn(nodeEl, 'querySelector').and.returnValue(treeNodeEl);
    component.update();
    expect(spy).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(treeNodeEl.hasAttribute('hasEventListener')).toBe(true);
  });
});
