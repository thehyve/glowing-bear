/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {TestBed} from '@angular/core/testing';
import {VariableService} from './variable.service';
import {Concept} from '../models/constraint-models/concept';
import {TreeNode} from 'primeng/api';
import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CountItem} from '../models/aggregate-models/count-item';
import {CountService} from './count.service';
import {CountServiceMock} from './mocks/count.service.mock';

describe('VariableService', () => {
  let variableService: VariableService;
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;
  let countService: CountService;
  let v1 = new Concept();
  v1.name = 'v1';
  v1.code = 'v1';
  v1.selected = false;
  v1.type = ConceptType.NUMERICAL;
  let v2 = new Concept();
  v2.name = 'v2';
  v2.code = 'v2';
  v2.selected = false;
  v2.type = ConceptType.CATEGORICAL;
  let v3 = new Concept();
  v3.name = 'v3';
  v3.code = 'v3';
  v3.selected = false;
  v3.type = ConceptType.TEXT;
  const dummyVariables: Concept[] = [v1, v2, v3];

  /*
   * remark: be careful with the order or service providers:
   * VariableService -> ConstraintService -> TreeNodeService
   * ConstraintService needs to stay before TreeNodeService
   * to avoid cyclic dependency injection in testing
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
        },
        VariableService
      ]
    });
    variableService = TestBed.get(VariableService);
    treeNodeService = TestBed.get(TreeNodeService);
    constraintService = TestBed.get(ConstraintService);
    countService = TestBed.get(CountService);
  });

  it('should be created', () => {
    const service: VariableService = TestBed.get(VariableService);
    expect(service).toBeTruthy();
  });

  it('should identify tree node variable dragged', () => {
    treeNodeService.selectedTreeNode = {} as TreeNode;
    let spy = spyOn(treeNodeService, 'getConceptFromTreeNode').and.callThrough();

    let element = variableService.identifyDraggedElement();

    expect(spy).toHaveBeenCalled();
    expect(element).not.toBeNull();
    expect(element).toEqual(jasmine.any(Concept));
  });

  it('should update variables when tree finishes loading', () => {
    const spyUpdateVariables = spyOn(variableService, 'updateVariables').and.stub();
    countService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(true);
    expect(spyUpdateVariables).toHaveBeenCalled();
  });

  it('should not update variables when tree is still loading', () => {
    const spyUpdateVariables = spyOn(variableService, 'updateVariables').and.stub();
    countService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(false);
    expect(spyUpdateVariables).not.toHaveBeenCalled();
  });

  it('should update variable in category view when tree-view nodes are checked', () => {
    let n: TreeNode = {};
    n['conceptCode'] = 'v2';
    n['type'] = 'CATEGORICAL';
    const selectedNodes = [n];
    spyOnProperty(variableService, 'variables', 'get').and.returnValue(dummyVariables);
    variableService['updateSelectedVariablesWithTreeNodes'](selectedNodes);
    expect(dummyVariables[0].selected).toBe(false);
    expect(dummyVariables[1].selected).toBe(true);
  });

  it('should update categorised and tree variables when variables get updated', () => {
    spyOnProperty(variableService, 'variables', 'get').and.returnValue(dummyVariables);
    const spyTreeSelection = spyOn(variableService, 'selectAllVariablesTree').and.stub();
    const spyVariablesUpdated = spyOn(variableService, 'variablesUpdated').and.stub();

    variableService.updateVariables().then(() => {
      expect(variableService.isUpdatingVariables).toBe(false);
      expect(dummyVariables[0].selected).toBe(true);
      expect(variableService.categorizedVariablesTree.length).toBe(3);
      expect(variableService.variablesTree.length).toBe(3);
      expect(spyTreeSelection).toHaveBeenCalled();
      expect(spyVariablesUpdated).toHaveBeenCalled();
    });

  });

  it('should update variables when tree nodes variables are checked', () => {
    spyOnProperty(variableService, 'variables', 'get').and.returnValue(dummyVariables);
    const spyTreeSelection = spyOn(variableService, 'updateSelectedVariablesWithTreeNodes').and.stub();

    variableService.selectedVariablesTree = [{}];

    expect(spyTreeSelection).toHaveBeenCalledWith([{}]);
    let selectedVariables = variableService.variables.filter(v => v.selected === true);
    expect(selectedVariables.length).toBe(0);
  });

  it('should call treeNodeService.flattenTreeNodes when checking all variable tree nodes', () => {
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
    spyOnProperty(variableService, 'variablesTree', 'get').and.returnValue([node]);
    const spy = spyOn(treeNodeService, 'flattenTreeNodes').and.stub();
    variableService.selectedVariablesTree = [];
    variableService.selectAllVariablesTree(true);
    expect(spy).toHaveBeenCalledWith([node], []);
  });

  it('should select all variables that are shared between nodes', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_2: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_2.parent = node_1;
    node_1_1['conceptCode'] = 'node_1_1';
    node_1_2['conceptCode'] = 'node_1_2';
    node_1.children = [node_1_1, node_1_2];
    node_1.parent = node;
    node_2.parent = node;
    node_2['conceptCode'] = 'node_1_1';
    node.children = [node_1, node_2];

    variableService.selectedVariablesTree = [];
    variableService.selectVariablesTreeByFields([node], [node_1_1['conceptCode']], ['conceptCode'], true);
    expect(variableService.selectedVariablesTree.length).toBe(2);
    expect(variableService.selectedVariablesTree).not.toContain(node_1_2);
    expect(variableService.selectedVariablesTree).toContain(node_2);
    expect(variableService.selectedVariablesTree).toContain(node_1_1);
  });

  it('should unselect all variables that are shared between nodes', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_2: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_2.parent = node_1;
    node_1_1['conceptCode'] = 'node_1_1';
    node_1_2['conceptCode'] = 'node_1_2';
    node_1.children = [node_1_1, node_1_2];
    node_1.parent = node;
    node_2.parent = node;
    node_2['conceptCode'] = 'node_1_1';
    node.children = [node_1, node_2];

    variableService.selectedVariablesTree = [node];
    variableService.unselectVariablesTreeByFields([node], [node_1_1['conceptCode']], ['conceptCode']);
    expect(variableService.selectedVariablesTree).not.toContain(node_2);
    expect(variableService.selectedVariablesTree).not.toContain(node_1_1);
  });

  it('should select variables tree nodes by paths', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_2: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_2.parent = node_1;
    node_1_1['fullName'] = '\\foo\\bar\\node_1_1\\';
    node_1_2['fullName'] = '\\foo\\bar\\node_1_2\\';
    node_1.children = [node_1_1, node_1_2];
    node_1.parent = node;
    node_2.parent = node;
    node_2['fullName'] = '\\foo\\node_2\\';
    node.children = [node_1, node_2, null];

    variableService.selectVariablesTreeByFields(
      [node], ['\\foo\\bar\\node_1_2\\', '\\foo\\node_2\\', '\\dummy\\'], ['fullName'], true);

    expect(variableService.selectedVariablesTree.length).toBe(2);
    expect(variableService.selectedVariablesTree).toContain(node_1_2);
    expect(variableService.selectedVariablesTree).toContain(node_2);

    spyOn(treeNodeService, 'isVariableNode').and.returnValue(true);

    variableService['isAdditionalImport'] = true;
    variableService.selectVariablesTreeByFields(
      [node], ['\\foo\\bar\\node_1_2\\', '\\dummy\\'], ['fullName'], true);
    expect(variableService.selectedVariablesTree.length).toBe(2);
    expect(variableService.selectedVariablesTree).toContain(node_1_2);
    expect(variableService.selectedVariablesTree).toContain(node_2);
  });

  it('should remove unselected tree nodes when additional import is off', () => {
    let node: TreeNode = {};
    let node_1: TreeNode = {};
    let node_1_1: TreeNode = {};
    let node_1_2: TreeNode = {};
    let node_2: TreeNode = {};
    node_1_1.parent = node_1;
    node_1_2.parent = node_1;
    node_1_1['fullName'] = '\\foo\\bar\\node_1_1\\';
    node_1_2['fullName'] = '\\foo\\bar\\node_1_2\\';
    node_1.children = [node_1_1, node_1_2];
    node_1.parent = node;
    node_2.parent = node;
    node_2['fullName'] = '\\foo\\node_2\\';
    node.children = [node_1, node_2];

    variableService.selectVariablesTreeByFields(
      [node], ['\\foo\\bar\\node_1_2\\', '\\foo\\node_2\\', '\\dummy\\'], ['fullName'], false);
    variableService['isAdditionalImport'] = false;
    variableService.selectVariablesTreeByFields(
      [node], ['\\foo\\bar\\node_1_2\\', '\\dummy\\'], ['fullName'], false);
    expect(variableService.selectedVariablesTree.length).toBe(1);
    expect(variableService.selectedVariablesTree).toContain(node_1_2);
  })

  it('should select variables tree nodes by names', () => {
    let nodeABC: TreeNode = {};
    nodeABC['metadata'] = {};
    nodeABC['metadata']['item_name'] = 'name3';
    let nodeAB: TreeNode = {};
    nodeAB.children = [nodeABC];
    let nodeADE: TreeNode = {};
    nodeADE['metadata'] = {};
    nodeADE['metadata']['item_name'] = 'name1';
    let nodeADEF: TreeNode = {};
    nodeADE.children = [nodeADEF];
    let nodeAD: TreeNode = {};
    nodeAD.children = [nodeADE];
    let nodeA: TreeNode = {};
    nodeA.children = [nodeAB, nodeAD];
    variableService.selectVariablesTreeByFields([nodeA], ['name1'], ['metadata', 'item_name'], true);

    expect(variableService.selectedVariablesTree.length).toBe(1);
    expect(variableService.selectedVariablesTree).toContain(nodeADE);
  });

  it('should update variables tree data', () => {
    let dummyTreeNodes = [{}];
    let spy1 = spyOn(treeNodeService, 'copyTreeNodes').and.returnValue(dummyTreeNodes);
    let spy2 = spyOn<any>(variableService, 'updateVariablesTreeRecursion').and.stub();
    let spy3 = spyOnProperty(variableService, 'variablesTree', 'get').and.returnValue(dummyTreeNodes);
    treeNodeService.treeNodesCopy = dummyTreeNodes;
    variableService.updateVariablesTree();
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();

    treeNodeService.treeNodesCopy = [];
    variableService.updateVariablesTree();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should update variables tree recursively', () => {
    /**
     conceptMap
     'a-code': (10,20)

     conceptMap1
     'a-code-1': (100, 200)

     selectedStudyConceptCountMap
     'an-id': conceptMap
     'an-id-1': conceptmap1

     selectedConceptCountMap
     'a-code-2': (1, 1)

     selectedStudyCountMap
     'an-id': (1, 1)

     - node1
     - node2
     - node2a (studyId='an-id-1', conceptCode='a-code-1')
     - node3
     - node4 (studyId='an-id', conceptCode='a-code')
     - node5
     - {}
     - node6 (studyId=undefined, conceptCode='a-code-2')
     */
    let studyId = 'an-id';
    let conceptCode = 'a-code';
    let studyId1 = 'an-id-1';
    let conceptCode1 = 'a-code-1';
    let conceptCode2 = 'a-code-2';
    let conceptMap = new Map<string, CountItem>();
    conceptMap.set(conceptCode, new CountItem(10, 20));
    countService.selectedStudyConceptCountMap = new Map<string, Map<string, CountItem>>();
    countService.selectedStudyConceptCountMap.set(studyId, conceptMap);
    let conceptMap1 = new Map<string, CountItem>();
    conceptMap1.set(conceptCode1, new CountItem(100, 200));
    countService.selectedStudyConceptCountMap.set(studyId1, conceptMap1);
    countService.selectedConceptCountMap = new Map<string, CountItem>();
    countService.selectedConceptCountMap.set(conceptCode2, new CountItem(1, 1));
    countService.selectedStudyCountMap = new Map<string, CountItem>();
    conceptMap1.set(studyId, new CountItem(1, 1));
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
    let resultNodes = variableService['updateVariablesTreeRecursion'](nodes);
    expect(node4['expanded']).toBe(false);
    expect(resultNodes.length).toEqual(3);
    expect(resultNodes[0]['label']).toBeUndefined();
    expect(resultNodes[1]['label']).toBeUndefined();
  });

  it('should import variables by names', () => {
    const spy = spyOn(variableService, 'selectVariablesTreeByFields').and.stub();
    const names = ['name1', 'name2'];
    variableService.importVariablesByNames(names);
    expect(spy).toHaveBeenCalledWith(variableService.variablesTree, names, ['metadata', 'item_name'], true);
  });

  it('should import variables by paths', () => {
    const spy = spyOn(variableService, 'selectVariablesTreeByFields').and.stub();
    const paths = ['path1', 'path2'];
    variableService.importVariablesByPaths(paths);
    expect(spy).toHaveBeenCalledWith(variableService.variablesTree, paths, ['fullName'], true);
  });
});
