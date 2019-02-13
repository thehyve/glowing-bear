/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {ConstraintService} from './constraint.service';
import {TreeNodeService} from './tree-node.service';
import {TreeNodeServiceMock} from './mocks/tree-node.service.mock';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {StudyService} from './study.service';
import {StudyServiceMock} from './mocks/study.service.mock';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {Concept} from '../models/constraint-models/concept';
import {VariablesViewMode} from '../models/variables-view-mode';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {TreeNode} from 'primeng/api';
import {ConceptType} from '../models/constraint-models/concept-type';

describe('ConstraintService', () => {
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConstraintService,
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    });
    constraintService = TestBed.get(ConstraintService);
    treeNodeService = TestBed.get(TreeNodeService);
  });

  it('should be injected',
    inject([ConstraintService], (service: ConstraintService) => {
      expect(service).toBeTruthy();
    }));

  it('should search all constraints', () => {
    let c1 = new ConceptConstraint();
    c1.textRepresentation = 'foo';
    let c2 = new StudyConstraint();
    c2.textRepresentation = 'bar';
    constraintService.allConstraints = [c1, c2];
    let result = constraintService.searchAllConstraints('');
    expect(result.length).toBe(2);
    result = constraintService.searchAllConstraints('fo');
    expect(result.length).toBe(1);
    result = constraintService.searchAllConstraints('non-exist');
    expect(result.length).toBe(0);
  });

  it('should generate variables constraint for categorized view', () => {
    constraintService.variablesViewMode = VariablesViewMode.CATEGORIZED_VIEW;
    let c1 = new Concept();
    c1.name = 'c1';
    c1.path = 'c1_path';
    c1.selected = true;
    let c2 = new Concept();
    c2.name = 'c2';
    c2.path = 'c2_path';
    c2.selected = true;
    constraintService.variables = [c1, c2];
    let result = constraintService.variableConstraint();
    expect(result).toEqual(jasmine.any(TrueConstraint));

    c1.selected = false;
    let result2 = constraintService.variableConstraint();
    expect(result2).toEqual(jasmine.any(CombinationConstraint));
    expect((result2 as CombinationConstraint).children.filter(c => c instanceof ConceptConstraint).length).toBe(1);
  });

  it('should generate variables constraint for variables tree view', () => {
    constraintService.variablesViewMode = VariablesViewMode.TREE_VIEW;
    treeNodeService.selectedVariablesTreeData = [];
    let result = constraintService.variableConstraint();
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
    treeNodeService.selectedVariablesTreeData = [selectedTreeNode];

    let result2 = constraintService.variableConstraint();
    expect(result2).toEqual(jasmine.any(CombinationConstraint));
    let children = (result2 as CombinationConstraint).children.filter(c => c instanceof CombinationConstraint);
    expect(children.length).toBe(1);
    expect((children[0] as CombinationConstraint).children.filter(c => c instanceof ConceptConstraint).length).toBe(1);
  });

  it('should identify tree node variable dragged', () => {
    constraintService.draggedVariable = null;
    treeNodeService.selectedTreeNode = {} as TreeNode;
    let spy = spyOn(treeNodeService, 'getConceptFromTreeNode').and.callThrough();

    let element = constraintService.identifyDraggedElement();

    expect(spy).toHaveBeenCalled();
    expect(element).not.toBeNull();
    expect(element).toEqual(jasmine.any(Concept));
  });

  it('should identify categorized variable dragged', () => {
    constraintService.draggedVariable = new Concept();
    treeNodeService.selectedTreeNode = null;

    let element = constraintService.identifyDraggedElement();

    expect(element).not.toBeNull();
    expect(element).toEqual(jasmine.any(Concept));
  });

  it('should update variables when tree finishes loading', () => {
    const spyUpdateVariables = spyOn(constraintService, 'updateVariables').and.stub();
    constraintService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(true);
    expect(spyUpdateVariables).toHaveBeenCalled();
  });

  it('should not update variables when tree is still loading', () => {
    const spyUpdateVariables = spyOn(constraintService, 'updateVariables').and.stub();
    constraintService.selectedConceptCountMapUpdated.next(null);
    treeNodeService.treeNodesUpdated.next(false);
    expect(spyUpdateVariables).not.toHaveBeenCalled();
  });

  it('should check and categorise variables when they are updated', () => {
    spyOnProperty(constraintService, 'variables', 'get').and.returnValue(dummyVariables);
    const spyTreeSelection = spyOn(treeNodeService, 'selectAllVariablesTreeData').and.stub();
    constraintService.variablesUpdated.next(dummyVariables);
    expect(dummyVariables[0].selected).toBe(true);
    expect(constraintService.categorizedVariables.length).toBe(3);
    expect(spyTreeSelection).toHaveBeenCalled();
  });

  it('should update variable in category view when tree-view nodes are checked', () => {
    let n: TreeNode = {};
    n['conceptCode'] = 'v2';
    n['type'] = 'CATEGORICAL';
    const selectedNodes = [n];
    spyOnProperty(constraintService, 'variables', 'get').and.returnValue(dummyVariables);
    treeNodeService.selectedVariablesTreeDataUpdated.asObservable().subscribe(_ => {
      expect(dummyVariables[0].selected).toBe(false);
      expect(dummyVariables[1].selected).toBe(true);
    });
    treeNodeService.selectedVariablesTreeDataUpdated.next(selectedNodes);
  });

  it('should update selected tree nodes in tree view when variables in category view are checked',
    () => {
      const spyTreeSelection = spyOn(treeNodeService, 'selectVariablesTreeDataByFields').and.stub();
      constraintService.selectedVariablesUpdated.next(dummyVariables);
      expect(spyTreeSelection).toHaveBeenCalled();
    });

});
