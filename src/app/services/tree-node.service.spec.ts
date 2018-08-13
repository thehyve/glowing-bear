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
import {Observable} from 'rxjs/Observable';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from '../utilities/error-helper';
import {TreeNode} from 'primeng/api';
import {ConceptType} from '../models/constraint-models/concept-type';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {throwError} from 'rxjs/internal/observable/throwError';

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
      return Observable.of(dummyNodes);
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
          return Observable.of([parentNode]);
        }
        return Observable.of([otherNode]);
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
      return Observable.of(null);
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
    treeNodeService.conceptCountMap = new Map<string, CountItem>();
    treeNodeService.conceptCountMap.set('concept1', new CountItem(10, 20));
    treeNodeService.conceptCountMap.set('concept2', new CountItem(30, 110));
    treeNodeService.conceptCountMap.set('concept3', new CountItem(70, 90));

    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);
    treeNodeService.studyConceptCountMap = new Map<string, Map<string, CountItem>>();
    treeNodeService.studyConceptCountMap.set('study1', map1);
    treeNodeService.studyConceptCountMap.set('study2', map2);

    treeNodeService.studyCountMap = new Map<string, CountItem>();
    treeNodeService.studyCountMap.set('study1', new CountItem(10, 20));
    treeNodeService.studyCountMap.set('study2', new CountItem(100, 200));

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
    expect(constraintService.conceptLabels.length).toBe(1);
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

    constraintService.conceptLabels = ['label'];
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
    expect(constraintService.conceptLabels.length).toBe(1);
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
    expect(constraintService.conceptLabels.length).toBe(1);
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

  it('should update projection tree data', () => {
    let dummyTreeNodes = [{}];
    let checklist = [
      'code1'
    ];
    let spy1 = spyOn(treeNodeService, 'copyTreeNodes').and.returnValue(dummyTreeNodes);
    let spy2 = spyOn(treeNodeService, 'updateProjectionTreeDataIterative').and.stub();
    let spy3 = spyOn(treeNodeService, 'checkProjectionTreeDataIterative').and.stub();
    treeNodeService.treeNodesCopy = dummyTreeNodes;
    treeNodeService.updateProjectionTreeData(checklist);
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();

    treeNodeService.treeNodesCopy = [];
    treeNodeService.updateProjectionTreeData(checklist);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  })

  it('should update final tree nodes for summary', () => {
    let dummy = [{}];
    let spy = spyOn(treeNodeService, 'copySelectedTreeNodes').and.returnValue(dummy);
    treeNodeService.updateFinalTreeNodes();
    expect(treeNodeService.finalTreeNodes).toBe(dummy);
  })

  it('should copy tree nodes', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_1['type'] = 'node_1_1_type';
    node_1.children = [node_1_1];
    node_1.type = 'node_1_type';
    node_1.parent = node;
    node.children = [node_1];
    let result = treeNodeService.copyTreeNodes([node]);
    expect(result[0].children[0].type).toEqual('node_1_type');
    expect(result[0].children[0].children[0].type).toEqual('node_1_1_type');
  })

  it('should copy selected tree nodes', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_1_3: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_2.parent = node_1;
    node_1_3.parent = node_1;
    node_1_1['type'] = 'node_1_1_type';
    node_1_2['type'] = 'node_1_2_type';
    node_1_3['type'] = 'node_1_3_type';
    node_1.children = [node_1_1, node_1_2, node_1_3];
    node_1.type = 'node_1_type';
    node_1.parent = node;
    node_1.partialSelected = true;
    node.children = [node_1];
    node.partialSelected = true;
    treeNodeService.selectedProjectionTreeData = [node_1_3];
    let result = treeNodeService.copySelectedTreeNodes([node]);
    expect(result[0].children[0].children[0].type).toEqual('node_1_3_type');
  })

  it('should copy tree nodes upwards', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_1['type'] = 'node_1_1_type';
    node_1.children = [node_1_1];
    node_1.type = 'node_1_type';
    node_1.parent = node;
    node.children = [node_1];
    node.type = 'node_type';
    let result = treeNodeService.copyTreeNodeUpward(node_1);
    expect(result.type).toEqual('node_1_type');
    expect(result.children).not.toBeDefined();
    expect(result.parent.type).toBe('node_type');
  })

  it('should iteratively check the projection tree data', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_1_3: TreeNode = {};
    node_1_1['type'] = 'node_1_1_type';
    node_1_1['fullName'] = 'node_1_1_fullname';
    node_1_2['type'] = 'node_1_2_type';
    node_1_2['fullName'] = 'node_1_2_fullname';
    node_1_3['type'] = 'node_1_3_type';
    node_1_3['fullName'] = 'node_1_3_fullname';
    node_1.children = [node_1_1, node_1_2, node_1_3];
    node_1.type = 'node_1_type';
    node_1['fullName'] = 'node_1_fullname';
    node.children = [node_1];
    treeNodeService.selectedProjectionTreeData = [];
    treeNodeService.checkProjectionTreeDataIterative([node], ['node_1_fullname', 'node_1_3_fullname']);
    expect(treeNodeService.selectedProjectionTreeData.length).toBe(2);
    expect(treeNodeService.selectedProjectionTreeData.includes(node_1)).toBe(true);
    expect(treeNodeService.selectedProjectionTreeData.includes(node_1_3)).toBe(true);
  })

  it('should check all projection tree data', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_1_3: TreeNode = {};
    node_1_1['fullName'] = 'node_1_1_fullname';
    node_1_2['fullName'] = 'node_1_2_fullname';
    node_1_3['fullName'] = 'node_1_3_fullname';
    node_1.children = [node_1_1, node_1_2, node_1_3];
    node_1['fullName'] = 'node_1_fullname';
    node.children = [node_1];
    treeNodeService.selectedProjectionTreeData = [];
    treeNodeService.checkAllProjectionTreeDataIterative([node]);
    expect(treeNodeService.selectedProjectionTreeData.length).toBe(5);
  })

  it('should get parent tree node paths', () => {
    let path = '\\a\\test\\path\\';
    let result = treeNodeService.getParentTreeNodePaths(path);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual('\\a\\');
    expect(result[1]).toEqual('\\a\\test\\');

    path = '\\a\\';
    result = treeNodeService.getParentTreeNodePaths(path);
    expect(result.length).toBe(0);
  })

  it('should expand or collapse tree nodes iteratively', () => {
    let node_1: TreeNode = {};
    let node: TreeNode = {};
    node.children = [node_1];
    treeNodeService.expandProjectionTreeDataIterative([node], true);
    expect(node['expanded']).toBe(true);
    window.setTimeout(() => {
      expect(node_1['expanded']).toBe(true);
    }, 110)
    treeNodeService.expandProjectionTreeDataIterative([node], false);
    expect(node['expanded']).toBe(false);
    expect(node_1['expanded']).toBe(false);
  })

  it('should get top tree nodes', () => {
    let nodeABC: TreeNode = {};
    nodeABC['fullName'] = 'A\\B\\C';
    let nodeAB: TreeNode = {};
    nodeAB['fullName'] = 'A\\B';
    let nodeADE: TreeNode = {};
    nodeADE['fullName'] = 'A\\D\\E';
    let nodeADEF: TreeNode = {};
    nodeADEF['fullName'] = 'A\\D\\E\\F';
    let nodeAE: TreeNode = {};
    nodeAE['fullName'] = 'A\\E';
    let nodes = [nodeABC, nodeAB, nodeADE, nodeADEF, nodeAE];
    let result = treeNodeService.getTopTreeNodes(nodes);
    expect(result.length).toBe(3);
    expect(result.includes(nodeAB)).toBe(true);
    expect(result.includes(nodeADE)).toBe(true);
    expect(result.includes(nodeAE)).toBe(true);
  })

  it('should find tree nodes by paths', () => {
    let nodeABC: TreeNode = {};
    nodeABC['fullName'] = 'A\\B\\C';
    let nodeAB: TreeNode = {};
    nodeAB['fullName'] = 'A\\B';
    let nodeADE: TreeNode = {};
    nodeADE['fullName'] = 'A\\D\\E';
    let nodeADEF: TreeNode = {};
    nodeADEF['fullName'] = 'A\\D\\E\\F';
    nodeADE.children = [nodeADEF];
    let nodeAE: TreeNode = {};
    nodeAE['fullName'] = 'A\\E';
    let nodes = [nodeABC, nodeAB, nodeADE, nodeADEF, nodeAE];
    let paths = ['A\\B', 'A\\D\\E'];
    let found = [];
    treeNodeService.findTreeNodesByPaths(nodes, paths, found)
    expect(found.length).toBe(2);
    expect(found.includes(nodeAB)).toBe(true);
    expect(found.includes(nodeADE)).toBe(true);
  })

  it('should find tree node ancestors', () => {
    let nodeABC: TreeNode = {};
    nodeABC['fullName'] = '\\A\\B\\C\\';
    let nodeAB: TreeNode = {};
    nodeAB['fullName'] = '\\A\\B\\';
    nodeAB.children = [nodeABC];
    let nodeADE: TreeNode = {};
    nodeADE['fullName'] = '\\A\\D\\E\\';
    let nodeADEF: TreeNode = {};
    nodeADEF['fullName'] = '\\A\\D\\E\\F\\';
    nodeADE.children = [nodeADEF];
    let nodeAD: TreeNode = {};
    nodeAD['fullName'] = '\\A\\D\\';
    nodeAD.children = [nodeADE];
    let nodeA: TreeNode = {};
    nodeA['fullName'] = '\\A\\';
    nodeA.children = [nodeAB, nodeAD];
    treeNodeService.treeNodes = [nodeA];
    let found = treeNodeService.findTreeNodeAncestors(nodeABC);
    expect(found.length).toBe(2);
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

  it('should update projection tree data iteratively', () => {
    let studyId = 'an-id';
    let conceptCode = 'a-code';
    let studyId1 = 'an-id-1';
    let conceptCode1 = 'a-code-1';
    let conceptCode2 = 'a-code-2';
    let conceptMap = new Map<string, CountItem>();
    conceptMap.set(conceptCode, new CountItem(10, 20));
    treeNodeService.selectedStudyConceptCountMap = new Map<string, Map<string, CountItem>>();
    treeNodeService.selectedStudyConceptCountMap.set(studyId, conceptMap);
    let conceptMap1 = new Map<string, CountItem>();
    conceptMap1.set(conceptCode1, new CountItem(100, 200));
    treeNodeService.selectedStudyConceptCountMap.set(studyId1, conceptMap1);
    treeNodeService.selectedConceptCountMap = new Map<string, CountItem>();
    treeNodeService.selectedConceptCountMap.set(conceptCode2, new CountItem(1, 1));
    let node1: TreeNode = {};
    let node2: TreeNode = {};
    let node2a: TreeNode = {};
    let node3: TreeNode = {};
    let node4: TreeNode = {};
    let node5: TreeNode = {};
    let node6: TreeNode = {};
    node1['visualAttributes'] = ['bar', 'foo', 'LEAF'];
    node2['children'] = [node2a];
    node4['visualAttributes'] = ['LEAF'];
    node4['studyId'] = studyId;
    node4['conceptCode'] = conceptCode;
    node4['name'] = 'a-name';
    node2a['visualAttributes'] = ['LEAF'];
    node2a['studyId'] = studyId1;
    node2a['conceptCode'] = conceptCode1;
    node5['children'] = [{}];
    node6['name'] = 'node6';
    node6['studyId'] = undefined;
    node6['conceptCode'] = conceptCode2;
    node6['visualAttributes'] = ['LEAF'];
    let nodes = [node1, node2, node3, node4, node5, node6];
    let resultNodes = treeNodeService.updateProjectionTreeDataIterative(nodes);
    expect(node4['expanded']).toBe(false);
    expect(resultNodes.length).toEqual(3);
    expect(resultNodes[0]['label']).toBeUndefined();
    expect(resultNodes[1]['label']).toBeDefined();
  })
});
