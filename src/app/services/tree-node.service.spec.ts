/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {NavbarService} from './navbar.service';
import {NavbarServiceMock} from './mocks/navbar.service.mock';
import {ConstraintService} from './constraint.service';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {of as observableOf} from 'rxjs';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from '../utilities/error-helper';
import {TreeNode} from 'primeng/api';
import {ConceptType} from '../models/constraint-models/concept-type';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {throwError} from 'rxjs/internal/observable/throwError';
import {AppConfigMock} from '../config/app.config.mock';
import {AppConfig} from '../config/app.config';

describe('TreeNodeService', () => {
  let treeNodeService: TreeNodeService;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;
  let navbarService: NavbarService;
  let httpErrorResponse: HttpErrorResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        TreeNodeService
      ]
    });
    treeNodeService = TestBed.get(TreeNodeService);
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
    navbarService = TestBed.get(NavbarService);
    httpErrorResponse = new HttpErrorResponse({
      error: 'error',
      headers: null,
      status: 404,
      statusText: 'status text',
      url: 'url'
    });
  });

  it('TreeNodeService should be injected', inject([TreeNodeService], (service: TreeNodeService) => {
    expect(service).toBeTruthy();
  }));

  it('should load initial layers of tree nodes', () => {
    let node1 = {};
    let node2 = {};
    let dummyNodes = [node1, node2];
    constraintService.concepts = [new Concept()];
    constraintService.conceptConstraints = [new ConceptConstraint()];
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return observableOf(dummyNodes);
    });
    let spy2 = spyOn(treeNodeService, 'processTreeNodes').and.stub();
    let spy3 = spyOn(treeNodeService, 'loadTreeNext').and.stub();
    treeNodeService.loadTreeNodes();
    expect(spy1).toHaveBeenCalled();
    expect(constraintService.concepts.length).toBe(0);
    expect(constraintService.conceptConstraints.length).toBe(0);
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(treeNodeService.treeNodes.length).toBe(2);
  })

  it('should handle error for the initial loading of tree nodes', () => {
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return throwError(httpErrorResponse);
    });
    let spy2 = spyOn(ErrorHelper, 'handleError').and.stub();
    treeNodeService.loadTreeNodes();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should iteratively load the next tree branch', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    }
    let otherNode = {
      fullName: 'other full name'
    }
    let spy1 = spyOn(resourceService, 'getTreeNodes')
      .and.callFake((fullname, depth, hasCounts, hasTag) => {
        if (fullname === parentFullName) {
          return observableOf([parentNode]);
        }
        return observableOf([otherNode]);
      })
    let spy2 = spyOn(treeNodeService, 'getTreeNodeDescendantsWithDepth')
      .and.callFake((refNode, depth, descendants) => {
        if (refNode['fullName'] === parentFullName) {
          descendants.push({});
          descendants.push({});
        }
      })
    let spy3 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    let spy4 = spyOn(treeNodeService, 'processTreeNodes').and.stub();
    let spy5 = spyOn(treeNodeService, 'loadTreeNext').and.callThrough();
    treeNodeService.loadTreeNext(parentNode, constraintService);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy5).toHaveBeenCalledTimes(3);
  })

  it('should handle edge cases of iterative tree loading', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    }
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return observableOf(null);
    })
    let spy2 = spyOn(treeNodeService, 'getTreeNodeDescendantsWithDepth').and.stub();
    let spy3 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    let spy4 = spyOn(treeNodeService, 'processTreeNodes').and.stub();
    treeNodeService.loadTreeNext(parentNode, constraintService);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
  })

  it('should handle error for iterative tree loading', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    }
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return throwError(httpErrorResponse);
    })
    let spy2 = spyOn(treeNodeService, 'getTreeNodeDescendantsWithDepth').and.stub();
    let spy3 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    let spy4 = spyOn(treeNodeService, 'processTreeNodes').and.stub();
    let spy5 = spyOn(ErrorHelper, 'handleError').and.stub();
    treeNodeService.loadTreeNext(parentNode, constraintService);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).toHaveBeenCalled();
  })

  it('should process tree nodes', () => {
    let node1 = {
      children: undefined
    };
    let node = {
      children: [node1]
    }
    let spy1 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    treeNodeService.processTreeNodes([node], constraintService);
    expect(spy1).toHaveBeenCalledTimes(2);
  })

  it('should handle edge case for processing tree nodes', () => {
    let spy1 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    treeNodeService.processTreeNodes(null, constraintService);
    expect(spy1).toHaveBeenCalledTimes(0);
  })

  it('should process a single tree node', () => {
    // construct the maps
    constraintService.conceptCountMap = new Map<string, CountItem>();
    constraintService.conceptCountMap.set('concept1', new CountItem(10, 20));
    constraintService.conceptCountMap.set('concept2', new CountItem(30, 110));
    constraintService.conceptCountMap.set('concept3', new CountItem(70, 90));

    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);
    constraintService.studyConceptCountMap = new Map<string, Map<string, CountItem>>();
    constraintService.studyConceptCountMap.set('study1', map1);
    constraintService.studyConceptCountMap.set('study2', map2);

    constraintService.studyCountMap = new Map<string, CountItem>();
    constraintService.studyCountMap.set('study1', new CountItem(10, 20));
    constraintService.studyCountMap.set('study2', new CountItem(100, 200));

    let node = {
      label: 'label',
      fullName: 'full name',
      name: 'name',
      conceptPath: 'concept path',
      conceptCode: 'concept2',
      type: 'type',
      constraint: {},
      visualAttributes: [
        'LEAF'
      ],
      metadata: 1
    };

    treeNodeService.processTreeNode(node, constraintService);
    expect(node['label']).toContain('ⓘ');
    expect(node['constraint']['fullName']).toEqual('full name');
    expect(node['constraint']['name']).toEqual('name');
    expect(node['constraint']['conceptPath']).toEqual('concept path');
    expect(node['constraint']['conceptCode']).toEqual('concept2');
    expect(node['constraint']['valueType']).toEqual('type');
    expect(constraintService.concepts.length).toBe(1);
    expect(constraintService.conceptConstraints.length).toBe(1);
    expect(constraintService.allConstraints.length).toBe(1);

    node.type = 'NUMERIC';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['icon']).toBeDefined();
    node.type = 'HIGH_DIMENSIONAL';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['icon']).toBeDefined();
    node.type = 'CATEGORICAL';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['icon']).toBeDefined();
    node.type = 'DATE';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['icon']).toBeDefined();
    node.type = 'TEXT';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['icon']).toBeDefined();

    constraintService.concepts.length = 0;
    constraintService.conceptConstraints.length = 0;
    constraintService.allConstraints.length = 0;
    node.constraint = undefined;
    let spy1 = spyOn(treeNodeService, 'getConceptFromTreeNode').and.returnValue({label: 'label'});
    treeNodeService.processTreeNode(node, constraintService);
    expect(spy1).toHaveBeenCalled();
    expect(node.constraint).not.toBeDefined();
    expect(constraintService.concepts.length).toBe(0);
    expect(constraintService.conceptConstraints.length).toBe(0);
    expect(constraintService.allConstraints.length).toBe(0);

    node['studyId'] = 'study2';
    treeNodeService.processTreeNode(node, constraintService);

    node.visualAttributes = ['FOLDER'];
    node.metadata = undefined;
    node['children'] = [{}];
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.constraint).not.toBeDefined();
    expect(constraintService.concepts.length).toBe(0);
    expect(constraintService.conceptConstraints.length).toBe(0);
    expect(constraintService.allConstraints.length).toBe(0);
    expect(node['label']).not.toContain('ⓘ');

    node['visualAttributes'] = ['FOLDER'];
    node['type'] = 'UNKNOWN';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['expandedIcon']).toBeDefined();
    expect(node['collapsedIcon']).toBeDefined();
    node['type'] = 'STUDY';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node['expandedIcon']).toBeDefined();
    expect(node['collapsedIcon']).toBeDefined();
  })

  it('should get concept from a tree node', () => {
    let node: TreeNode = {};
    node['name'] = 'name';
    node['fullName'] = '\\full\\name\\';
    node['conceptPath'] = 'path';
    node['conceptCode'] = 'code';
    node['type'] = 'NUMERIC';
    let concept = treeNodeService.getConceptFromTreeNode(node);
    expect(concept.label).toEqual('name (\\full)');
    expect(concept.path).toEqual('path');
    expect(concept.type).toEqual(ConceptType.NUMERICAL);
    expect(concept.code).toEqual('code');
    expect(concept.fullName).toEqual('\\full\\name\\');
    expect(concept.name).toEqual('name');

    node['type'] = undefined;
    let spy = spyOn(MessageHelper, 'alert').and.stub();
    concept = treeNodeService.getConceptFromTreeNode(node);
    expect(spy).toHaveBeenCalled();
    expect(concept).toBeNull();
  })

  it('should get tree node descendants with given depth', () => {
    let node_1_1 = {}
    let node_1 = {
      children: [node_1_1]
    }
    let node = {
      children: [node_1]
    }
    let desc = [];
    treeNodeService.getTreeNodeDescendantsWithDepth(null, 3, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithDepth({}, 3, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithDepth({}, 1, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithDepth({}, 2, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithDepth(node, 2, desc);
    expect(desc.length).toBe(1);
    treeNodeService.getTreeNodeDescendantsWithDepth(node, 3, desc);
    expect(desc.length).toBe(2);
  })

  it('should get tree ndoe descendants with given excluded types', () => {
    let node_1_1 = {
      type: 'node_1_1_type'
    }
    let node_1 = {
      children: [node_1_1],
      type: 'node_1_type'
    }
    let node = {
      children: [node_1]
    }
    let desc = [];
    let types = ['type1']
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes(null, types, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes({}, types, desc);
    expect(desc.length).toBe(0);
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes(node, types, desc);
    expect(desc.length).toBe(1);

    node['type'] = 'type1';
    desc = [];
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes(node, types, desc);
    expect(desc.length).toBe(1);

    node_1['type'] = 'type1';
    desc = [];
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes(node, types, desc);
    expect(desc.length).toBe(1);

    node_1_1['type'] = 'type1';
    desc = [];
    treeNodeService.getTreeNodeDescendantsWithExcludedTypes(node, types, desc);
    expect(desc.length).toBe(0);
  })


  it('should convert tree nodes to paths', () => {
    let nodeABC: TreeNode = {};
    nodeABC['fullName'] = '\\A\\B\\C\\';
    nodeABC['metadata'] = {};
    nodeABC['metadata']['item_name'] = 'name3';
    let nodeAB: TreeNode = {};
    nodeAB['fullName'] = '\\A\\B\\';
    nodeAB.children = [nodeABC];
    let nodeADE: TreeNode = {};
    nodeADE['fullName'] = '\\A\\D\\E\\';
    nodeADE['metadata'] = {};
    nodeADE['metadata']['item_name'] = 'name1';
    let nodeADEF: TreeNode = {};
    nodeADEF['fullName'] = '\\A\\D\\E\\F\\';
    nodeADE.children = [nodeADEF];
    let nodeAD: TreeNode = {};
    nodeAD['fullName'] = '\\A\\D\\';
    nodeAD.children = [nodeADE];
    let nodeA: TreeNode = {};
    nodeA['fullName'] = '\\A\\';
    nodeA.children = [nodeAB, nodeAD];
    let paths = [];
    treeNodeService.convertItemsToPaths([nodeA, null], ['name1'], paths);
    expect(paths.length).toBe(1);
    expect(paths[0]).toBe('\\A\\D\\E\\');
  })

  it('should verify if a tree node is concept node', () => {
    let node: TreeNode = {};
    node['type'] = 'NUMERIC';
    let isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(true);
    node['type'] = 'CATEGORICAL';
    isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(true);
    node['type'] = 'DATE';
    isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(true);
    node['type'] = 'TEXT';
    isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(true);
    node['type'] = 'HIGH_DIMENSIONAL';
    isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(true);
    node['type'] = undefined;
    isConcept = treeNodeService.isTreeNodeConcept(node);
    expect(isConcept).toBe(false);
  })

  it('should verify if a tree node is study node', () => {
    let node: TreeNode = {};
    node['type'] = 'STUDY';
    let isStudy = treeNodeService.isTreeNodeStudy(node);
    expect(isStudy).toBe(true);
    node['type'] = undefined;
    isStudy = treeNodeService.isTreeNodeStudy(node);
    expect(isStudy).toBe(false);
  })

  it('should verify if a tree node is leaf node', () => {
    let node: TreeNode = {};
    node['visualAttributes'] = ['bar', 'foo', 'LEAF'];
    let is = treeNodeService.isTreeNodeLeaf(node);
    expect(is).toBe(true);
  })
});
