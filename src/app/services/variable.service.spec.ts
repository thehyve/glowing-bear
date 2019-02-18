/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {TestBed} from '@angular/core/testing';
import {VariableService} from './variable.service';
import {VariablesViewMode} from '../models/variables-view-mode';
import {Concept} from '../models/constraint-models/concept';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {TreeNode} from 'primeng/api';
import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CountItem} from '../models/aggregate-models/count-item';

describe('VariableService', () => {
  let variableService: VariableService;
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;
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
        VariableService
      ]
    });
    variableService = TestBed.get(VariableService);
    treeNodeService = TestBed.get(TreeNodeService);
    constraintService = TestBed.get(ConstraintService);
  });

  it('should be created', () => {
    const service: VariableService = TestBed.get(VariableService);
    expect(service).toBeTruthy();
  });

  it('should generate variables constraint for categorized view', () => {
    variableService.variablesViewMode = VariablesViewMode.CATEGORIZED_VIEW;
    let c1 = new Concept();
    c1.name = 'c1';
    c1.path = 'c1_path';
    c1.selected = true;
    let c2 = new Concept();
    c2.name = 'c2';
    c2.path = 'c2_path';
    c2.selected = true;
    variableService.variables = [c1, c2];
    let result = variableService.variableConstraint();
    expect(result).toEqual(jasmine.any(TrueConstraint));

    c1.selected = false;
    let result2 = variableService.variableConstraint();
    expect(result2).toEqual(jasmine.any(CombinationConstraint));
    expect((result2 as CombinationConstraint).children.filter(c => c instanceof ConceptConstraint).length).toBe(1);
  });

  it('should generate variables constraint for variables tree view', () => {
    variableService.variablesViewMode = VariablesViewMode.TREE_VIEW;
    variableService.selectedVariablesTree = [];
    let result = variableService.variableConstraint();
    expect(result).toEqual(jasmine.any(NegationConstraint));

    let selectedTreeNode = {};
    selectedTreeNode['conceptCode'] = 'O1KP:CAT1';
    selectedTreeNode['conceptPath'] = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\';
    let constraintObj = {
      args: [
        {
          conceptCode: 'O1KP:CAT1',
          type: 'concept'
        },
        {
          studyId: 'ORACLE_1000_PATIENT',
          type: 'study_name'
        }
      ],
      type: 'and',
      conceptCode: 'O1KP:CAT1',
      conceptPath: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\',
      fullName: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\',
      name: 'categorical_1',
      valueType: 'CATEGORICAL'
    };
    selectedTreeNode['constraint'] = constraintObj;
    selectedTreeNode['fullName'] = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\';
    selectedTreeNode['icon'] = 'icon-abc';
    selectedTreeNode['label'] = 'categorical_1 (sub: 1200, obs: 1200)';
    selectedTreeNode['name'] = 'categorical_1';
    selectedTreeNode['studyId'] = 'ORACLE_1000_PATIENT';
    selectedTreeNode['type'] = 'CATEGORICAL';
    selectedTreeNode['visualAttributes'] = ['LEAF', 'ACTIVE', 'CATEGORICAL'];
    variableService.selectedVariablesTree = [selectedTreeNode];

    let result2 = variableService.variableConstraint();
    expect(result2).toEqual(jasmine.any(CombinationConstraint));
    let children = (result2 as CombinationConstraint).children.filter(c => c instanceof CombinationConstraint);
    expect(children.length).toBe(1);
    expect((children[0] as CombinationConstraint).children.filter(c => c instanceof ConceptConstraint).length).toBe(1);
  });

  it('should identify tree node variable dragged', () => {
    variableService.draggedVariable = null;
    treeNodeService.selectedTreeNode = {} as TreeNode;
    let spy = spyOn(treeNodeService, 'getConceptFromTreeNode').and.callThrough();

    let element = variableService.identifyDraggedElement();

    expect(spy).toHaveBeenCalled();
    expect(element).not.toBeNull();
    expect(element).toEqual(jasmine.any(Concept));
  });

  it('should identify categorized variable dragged', () => {
    variableService.draggedVariable = new Concept();
    treeNodeService.selectedTreeNode = null;

    let element = variableService.identifyDraggedElement();

    expect(element).not.toBeNull();
    expect(element).toEqual(jasmine.any(Concept));
  });

  it('should update variables when tree finishes loading', () => {
    const spyUpdateVariables = spyOn(variableService, 'updateVariables').and.stub();
    constraintService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(true);
    expect(spyUpdateVariables).toHaveBeenCalled();
  });

  it('should not update variables when tree is still loading', () => {
    const spyUpdateVariables = spyOn(variableService, 'updateVariables').and.stub();
    constraintService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(false);
    expect(spyUpdateVariables).not.toHaveBeenCalled();
  });

  it('should check and categorise variables when they are updated', () => {
    spyOnProperty(variableService, 'variables', 'get').and.returnValue(dummyVariables);
    const spyTreeSelection = spyOn(variableService, 'selectAllVariablesTree').and.stub();
    variableService.variablesUpdated.next(dummyVariables);
    expect(dummyVariables[0].selected).toBe(true);
    expect(variableService.categorizedVariables.length).toBe(3);
    expect(spyTreeSelection).toHaveBeenCalled();
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

  it('should update selected tree nodes in tree view when variables in category view are checked',
    () => {
      const spyTreeSelection = spyOn(variableService, 'selectVariablesTreeByFields').and.stub();
      variableService.selectedVariablesUpdated.next(dummyVariables);
      expect(spyTreeSelection).toHaveBeenCalled();
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
    node.children = [node_1, node_2];

    variableService.selectVariablesTreeByFields(
      [node], ['\\foo\\bar\\node_1_2\\', '\\foo\\node_2\\', '\\dummy\\'], ['fullName']);

    expect(variableService.selectedVariablesTree.length).toBe(2);
    expect(variableService.selectedVariablesTree).toContain(node_1_2);
    expect(variableService.selectedVariablesTree).toContain(node_2);
  });

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
    variableService.selectVariablesTreeByFields([nodeA], ['name1'], ['metadata', 'item_name']);

    expect(variableService.selectedVariablesTree.length).toBe(1);
    expect(variableService.selectedVariablesTree).toContain(nodeADE);
  });

  it('should update variables tree data', () => {
    let dummyTreeNodes = [{}];
    let spy1 = spyOn(treeNodeService, 'copyTreeNodes').and.returnValue(dummyTreeNodes);
    let spy2 = spyOn<any>(variableService, 'updateVariablesTreeRecursion').and.stub();
    let spy3 = spyOnProperty(variableService, 'variablesTree', 'get').and.returnValue(dummyTreeNodes);
    treeNodeService.treeNodesCopy = dummyTreeNodes;
    variableService.updateVariablesTree(new Map(), new Map(), new Map());
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();

    treeNodeService.treeNodesCopy = [];
    variableService.updateVariablesTree(new Map(), new Map(), new Map());
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
    let selectedStudyConceptCountMap = new Map<string, Map<string, CountItem>>();
    selectedStudyConceptCountMap.set(studyId, conceptMap);
    let conceptMap1 = new Map<string, CountItem>();
    conceptMap1.set(conceptCode1, new CountItem(100, 200));
    selectedStudyConceptCountMap.set(studyId1, conceptMap1);
    let selectedConceptCountMap = new Map<string, CountItem>();
    selectedConceptCountMap.set(conceptCode2, new CountItem(1, 1));
    let selectedStudyCountMap = new Map<string, CountItem>();
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
    let resultNodes = variableService['updateVariablesTreeRecursion'](nodes,
      selectedStudyConceptCountMap, selectedConceptCountMap, selectedStudyCountMap);
    expect(node4['expanded']).toBe(false);
    expect(resultNodes.length).toEqual(3);
    expect(resultNodes[0]['label']).toBeUndefined();
    expect(resultNodes[1]['label']).toBeUndefined();
  });

});
