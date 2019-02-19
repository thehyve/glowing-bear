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

describe('Integration tests for cross table ', () => {

  let resourceService: ResourceService;
  let constraintService: ConstraintService;
  let crossTableService: CrossTableService;
  let selectedTreeNode: TreeNode;

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
        NavbarService
      ]
    });
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
    crossTableService = TestBed.get(CrossTableService);

    selectedTreeNode = {};
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
  });

  it('should update the cross table on tree node drop', () => {
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
    let conjunctiveCategorical = constraintService.generateConstraintFromTreeNode(selectedTreeNode);
    crossTableService.crossTable.rowConstraints.push(conjunctiveCategorical);
    let isValid = crossTableService.isValidConstraint(conjunctiveCategorical);
    conjunctiveCategorical.textRepresentation = CrossTableService.brief(conjunctiveCategorical);
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
    let conjunctiveCategorical: Constraint = constraintService.generateConstraintFromTreeNode(selectedTreeNode);
    crossTableService.crossTable.rowConstraints.push(categorical);
    crossTableService.crossTable.columnConstraints.push(conjunctiveCategorical);
    expect(crossTableService.crossTable.rowHeaderConstraints).toBeUndefined();
    expect(crossTableService.crossTable.columnHeaderConstraints).toBeUndefined();
    crossTableService.updateCells()
      .then(() => {
        fail('should have failed retrieving cross table cells because there is no constraint values.')
      })
      .catch((err) => {
        expect(crossTableService.crossTable.rowHeaderConstraints).not.toBeDefined();
        expect(crossTableService.crossTable.columnHeaderConstraints).not.toBeDefined();
      });
    // when the value constraints are defined
    crossTableService.crossTable.valueConstraints = new Map<Constraint, Array<Constraint>>();
    let v1 = new ValueConstraint();
    v1.valueType = 'STRING';
    v1.operator = '=';
    v1.textRepresentation = 'V1';
    let v2 = new ValueConstraint();
    v2.valueType = 'STRING';
    v2.operator = '=';
    v2.textRepresentation = 'V2';
    let v3 = new ValueConstraint();
    v3.valueType = 'STRING';
    v3.operator = '=';
    v3.textRepresentation = 'V3';
    let v4 = new ValueConstraint();
    v4.valueType = 'STRING';
    v4.operator = '=';
    v4.textRepresentation = 'V4';
    let v5 = new ValueConstraint();
    v5.valueType = 'STRING';
    v5.operator = '=';
    v5.textRepresentation = 'V5';
    crossTableService.crossTable.valueConstraints.set(categorical, [v1, v2]);
    crossTableService.crossTable.valueConstraints.set(conjunctiveCategorical, [v3, v4, v5]);
    crossTableService.updateCells()
      .then(() => {
        // since this does not involve real backend calls, no header constraints are defined
        expect(crossTableService.crossTable.rowHeaderConstraints).not.toBeDefined();
        expect(crossTableService.crossTable.columnHeaderConstraints).not.toBeDefined();
      })
      .catch((err) => {
        fail('should have succeeded retrieving cross table cells because there is constraint values.')
      });
  });

});
