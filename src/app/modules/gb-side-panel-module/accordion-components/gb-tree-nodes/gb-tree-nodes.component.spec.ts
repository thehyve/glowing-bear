/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTreeNodesComponent} from './gb-tree-nodes.component';
import {AutoCompleteModule, DragDropModule, OverlayPanelModule, TreeModule, TreeNode} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';

describe('TreeNodesComponent', () => {
  let component: GbTreeNodesComponent;
  let fixture: ComponentFixture<GbTreeNodesComponent>;
  let treeNodeService: TreeNodeService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTreeNodesComponent],
      imports: [
        BrowserAnimationsModule,
        TreeModule,
        OverlayPanelModule,
        DragDropModule,
        FormsModule,
        AutoCompleteModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
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
    fixture = TestBed.createComponent(GbTreeNodesComponent);
    component = fixture.componentInstance;
    treeNodeService = TestBed.get(TreeNodeService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should update metadata', () => {
    let metadata = {
      foo1: 'bar1',
      foo2: 'bar2'
    };
    component.updateMetadataContent(metadata);
    expect(component.metadataContent[0].key).toEqual('foo1');
    expect(component.metadataContent[0].val).toEqual('bar1');
    expect(component.metadataContent[1].key).toEqual('foo2');
    expect(component.metadataContent[1].val).toEqual('bar2');
  })

  it('should update event listners', () => {
    let elm = {
      querySelector: function (arg: string) {
        if (arg === 'li.ui-treenode') {
          return treeNodeElm;
        } else if (arg === 'li.ui-treenode .ui-treenode-label') {
          return treeNodeElmIcon;
        } else if (arg === '.ui-treenode-children') {
          return null;
        }
      }
    };
    let treeNodeElm = {
      addEventListener: function (onWhich: string, callback: Function) {
      }
    }
    let treeNodeElmIcon = {
      addEventListener: function (onWhich: string, callback: Function) {
      }
    };
    let node = {
      type: 'a-type',
      metadata: {
        key: 'foo',
        val: 'bar'
      }
    };
    let treeNodeElements = [elm];
    let treeNodes = [node];
    let spy2 = spyOn(treeNodeElm, 'addEventListener').and.stub();
    let spy3 = spyOn(treeNodeElmIcon, 'addEventListener').and.stub();
    component.updateEventListeners(treeNodeElements, treeNodes);
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).toHaveBeenCalledTimes(2)

  })

  it('should not add event listeners to treenode icon when there is no metadata', () => {
    let elm = {
      querySelector: function (arg: string) {
        if (arg === 'li.ui-treenode') {
          return treeNodeElm;
        } else if (arg === 'li.ui-treenode .ui-treenode-icon') {
          return treeNodeElmIcon;
        } else if (arg === '.ui-treenode-children') {
          return null;
        }
      }
    };
    let node = {
      type: 'type-A'
    };
    let treeNodeElm = {
      addEventListener: function (onWhich: string, callback: Function) {
      }
    }
    let treeNodeElmIcon = {
      addEventListener: function (onWhich: string, callback: Function) {
      }
    };
    let spy1 = spyOn(treeNodeElm, 'addEventListener').and.stub();
    let spy2 = spyOn(treeNodeElmIcon, 'addEventListener').and.stub();
    treeNodeService.validTreeNodeTypes = ['type-A'];
    component.updateEventListeners([elm], [node]);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled()
  })

  it('should filter tree nodes', () => {
    let result = component.filterWithHighlightTreeNodes(null, '', '');
    expect(result['hasMatching']).toBe(false);
    result = component.filterWithHighlightTreeNodes([], '', '');
    expect(result['hasMatching']).toBe(false);
    let node = {};
    component.filterWithHighlightTreeNodes([node], '', '');
    expect(node['expanded']).toBe(false);
    expect(node['styleClass']).not.toBeDefined();

    node['children'] = [{}];
    component.filterWithHighlightTreeNodes([node], '', '');
    expect(node['styleClass']).toBe('is-not-leaf');

    let word = 'some';
    let field = 'name';
    node['children'] = [];
    node[field] = word + ' Something else 123';
    component.filterWithHighlightTreeNodes([node], field, word);
    expect(node['expanded']).toBe(false);
    expect(node['styleClass']).toBe('gb-highlight-treenode');

    let leaf = {};
    leaf[field] = 'test';
    node['children'] = [leaf];
    component.filterWithHighlightTreeNodes([node], field, word);
    expect(node['styleClass']).toBe('gb-highlight-treenode gb-is-not-leaf');

    leaf[field] = word + ' test';
    component.filterWithHighlightTreeNodes([node], field, word);
    expect(node['expanded']).toBe(true);

    component.maxNumExpandedNodes = 0;
    component.filterWithHighlightTreeNodes([node], field, word);
    expect(node['expanded']).toBe(false);

    node[field] = ' ABC else 123';
    component.filterWithHighlightTreeNodes([node], field, word);
    expect(node['styleClass']).not.toBeDefined();

  })
});
