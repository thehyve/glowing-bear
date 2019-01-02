/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';
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

describe('ConstraintService', () => {
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;

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

  it('should select imported variables', () => {
    let c1 = new Concept();
    c1.name = 'c1';
    c1.path = 'c1_path';
    c1.selected = false;
    let c2 = new Concept();
    c2.name = 'c2';
    c2.path = 'c2_path';
    c2.selected = false;
    constraintService.variablesViewMode = VariablesViewMode.CATEGORIZED_VIEW;
    constraintService.variables = [c1, c2];
    let spy1 = spyOn(treeNodeService, 'selectVariablesTreeNodesByNames').and.callThrough();
    let spy2 = spyOn(treeNodeService, 'selectVariablesTreeNodesByPaths').and.callThrough();

    constraintService.importVariablesByNames(['c2', 'c3']);

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(constraintService.variables.filter(v => v.selected === true).length).toBe(1);

    constraintService.importVariablesByPaths(['c1_path']);

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(constraintService.variables.filter(v => v.selected === true).length).toBe(2);

    constraintService.variablesViewMode = VariablesViewMode.TREE_VIEW;
    constraintService.importVariablesByPaths(['c1_path']);

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    constraintService.importVariablesByNames(['c1']);

    expect(spy1).toHaveBeenCalled();
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

});
