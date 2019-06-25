/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ResourceService} from '../app/services/resource.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {TestBed} from '@angular/core/testing';
import {CrossTableService} from '../app/services/cross-table.service';
import {ConstraintService} from '../app/services/constraint.service';
import {TreeNode} from 'primeng/api';
import {Constraint} from '../app/models/constraint-models/constraint';
import {TreeNodeService} from '../app/services/tree-node.service';
import {NavbarService} from '../app/services/navbar.service';
import {CategoricalAggregate} from '../app/models/aggregate-models/categorical-aggregate';
import {of as observableOf} from 'rxjs';
import {ConceptConstraint} from '../app/models/constraint-models/concept-constraint';
import {Concept} from '../app/models/constraint-models/concept';
import {ConceptType} from '../app/models/constraint-models/concept-type';
import {StudyService} from '../app/services/study.service';
import {ValueConstraint} from '../app/models/constraint-models/value-constraint';
import {AppConfigMock} from '../app/config/app.config.mock';
import {AppConfig} from '../app/config/app.config';
import {ValueType} from '../app/models/constraint-models/value-type';
import {Operator} from '../app/models/constraint-models/operator';
import {
  ExtendedConceptConstraint,
  TransmartAndConstraint,
  TransmartStudyNameConstraint
} from '../app/models/transmart-models/transmart-constraint';
import {ConstraintHelper} from '../app/utilities/constraint-utilities/constraint-helper';
import {CombinationConstraint} from '../app/models/constraint-models/combination-constraint';
import {CohortService} from '../app/services/cohort.service';
import {Cohort} from '../app/models/cohort-models/cohort';
import {StudyConstraint} from '../app/models/constraint-models/study-constraint';

describe('Integration tests for cross table ', () => {

  let resourceService: ResourceService;
  let constraintService: ConstraintService;
  let crossTableService: CrossTableService;
  let treeNodeService: TreeNodeService;
  let selectedTreeNode: TreeNode;
  let cohortService: CohortService;

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
        ConstraintService,
        StudyService,
        CrossTableService,
        TreeNodeService,
        NavbarService,
        CohortService
      ]
    });
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
    cohortService = TestBed.get(CohortService);
    crossTableService = TestBed.get(CrossTableService);
    treeNodeService = TestBed.get(TreeNodeService);

    selectedTreeNode = {};
    selectedTreeNode['conceptCode'] = 'O1KP:CAT1';
    selectedTreeNode['conceptPath'] = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\';
    const constraintObj: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'concept',
          conceptCode: 'O1KP:CAT1',
          conceptPath: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\',
          fullName: '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\',
          name: 'categorical_1',
          valueType: 'CATEGORICAL'
        } as ExtendedConceptConstraint,
        {
          type: 'study_name',
          studyId: 'ORACLE_1000_PATIENT'
        } as TransmartStudyNameConstraint
      ]
    };
    selectedTreeNode['constraint'] = constraintObj;
    selectedTreeNode['fullName'] = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\';
    selectedTreeNode['icon'] = 'icon-abc';
    selectedTreeNode['label'] = 'categorical_1 (sub: 1200, obs: 1200)';
    selectedTreeNode['name'] = 'categorical_1';
    selectedTreeNode['studyId'] = 'ORACLE_1000_PATIENT';
    selectedTreeNode['type'] = 'CATEGORICAL';
    selectedTreeNode['visualAttributes'] = ['LEAF', 'ACTIVE', 'CATEGORICAL'];
  });

  it('should update the cross table on tree node drop', () => {
    let selectedCohort1 = new Cohort('c1', 'name');
    selectedCohort1.selected = true;
    selectedCohort1.constraint = new ConceptConstraint();
    let selectedCohort2 = new Cohort('c1', 'name');
    selectedCohort2.selected = true;
    selectedCohort2.constraint = new StudyConstraint();
    cohortService.cohorts.push(selectedCohort1);
    cohortService.cohorts.push(selectedCohort2);
    // tree node drop to row zone
    let spy1 = spyOn(resourceService, 'getCategoricalAggregate').and.callFake(() => {
      let agg = new CategoricalAggregate();
      agg.valueCounts.set('heart', 10);
      agg.valueCounts.set('liver', 20);
      return observableOf(agg);
    });
    let spy2 = spyOn(crossTableService, 'updateCells').and.callThrough();
    let spy3 = spyOn(resourceService, 'getCrossTable').and.callFake(() => {
      return observableOf(crossTableService.crossTable);
    });
    let conjunctiveCategorical = treeNodeService.generateConstraintFromTreeNode(selectedTreeNode);
    crossTableService.crossTable.rowConstraints.push(conjunctiveCategorical);
    let isValid = crossTableService.isValidConstraint(conjunctiveCategorical);
    conjunctiveCategorical.textRepresentation = ConstraintHelper.brief(conjunctiveCategorical);
    let constraints: Constraint[] = [];
    constraints.push(conjunctiveCategorical);
    let promise = crossTableService.update(constraints);
    expect(isValid).toBe(true);
    expect(spy1).toHaveBeenCalled();
    promise.then(() => {
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
      expect(crossTableService.crossTable.rowConstraints.length).toBe(1);
      expect(crossTableService.crossTable.rowHeaderConstraints.length).toBe(2);
      expect(cohortService.allSelectedCohortsConstraint.className).toBe('CombinationConstraint');
      expect(crossTableService.crossTable.constraint.className).toBe('CombinationConstraint');
      expect((<CombinationConstraint>crossTableService.crossTable.constraint).children.length).toBe(3);
      expect((<CombinationConstraint>crossTableService.crossTable.constraint).children.map(it => it.className))
        .toEqual(<any>jasmine.arrayContaining(['ConceptConstraint', 'TrueConstraint', 'StudyConstraint']));
    });
  });

  it('should update the cells of the cross table when value constraints are present', () => {
    let categorical: ConceptConstraint = new ConceptConstraint();
    categorical.concept = new Concept();
    categorical.concept.name = 'categorical_2';
    categorical.concept.fullName = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_2\\';
    categorical.concept.code = 'ORACLE_1000_PATIENT_2';
    categorical.concept.label = 'categorical_2 (sub: 1200, obs: 1200)';
    categorical.concept.type = ConceptType.CATEGORICAL;
    let conjunctiveCategorical: Constraint = treeNodeService.generateConstraintFromTreeNode(selectedTreeNode);
    crossTableService.crossTable.rowConstraints.push(categorical);
    crossTableService.crossTable.columnConstraints.push(conjunctiveCategorical);
    expect(crossTableService.crossTable.rowHeaderConstraints).toBeUndefined();
    expect(crossTableService.crossTable.columnHeaderConstraints).toBeUndefined();
    crossTableService.updateCells()
      .then(() => {
        fail('should have failed retrieving cross table cells because there is no constraint values.')
      })
      .catch((err) => {
        expect(crossTableService.crossTable.rowHeaderConstraints).toEqual([[]]);
        expect(crossTableService.crossTable.columnHeaderConstraints).toEqual([[]]);
      });
    // when the value constraints are defined
    crossTableService.crossTable.valueConstraints = new Map<Constraint, Array<Constraint>>();
    let v1 = new ValueConstraint();
    v1.valueType = <ValueType>'string';
    v1.operator = <Operator>'=';
    v1.textRepresentation = 'V1';
    let v2 = new ValueConstraint();
    v2.valueType = <ValueType>'string';
    v2.operator = <Operator>'=';
    v2.textRepresentation = 'V2';
    let v3 = new ValueConstraint();
    v3.valueType = <ValueType>'string';
    v3.operator = <Operator>'=';
    v3.textRepresentation = 'V3';
    let v4 = new ValueConstraint();
    v4.valueType = <ValueType>'string';
    v4.operator = <Operator>'=';
    v4.textRepresentation = 'V4';
    let v5 = new ValueConstraint();
    v5.valueType = <ValueType>'string';
    v5.operator = <Operator>'=';
    v5.textRepresentation = 'V5';
    crossTableService.crossTable.valueConstraints.set(categorical, [v1, v2]);
    crossTableService.crossTable.valueConstraints.set(conjunctiveCategorical, [v3, v4, v5]);
    crossTableService.updateCells()
      .then(() => {
        // since this does not involve real backend calls, header constraints are empty
        expect(crossTableService.crossTable.rowHeaderConstraints).toEqual([[]]);
        expect(crossTableService.crossTable.columnHeaderConstraints).toEqual([[]]);
      })
      .catch((err) => {
        fail('should have succeeded retrieving cross table cells because there is constraint values.')
      });
  });

});
