/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ResourceService} from '../app/services/resource.service';
import {ResourceServiceMock} from '../app/services/mocks/resource.service.mock';
import {TestBed} from '@angular/core/testing';
import {DropMode} from '../app/models/drop-mode';
import {CrossTableService} from '../app/services/cross-table.service';
import {ConstraintService} from '../app/services/constraint.service';
import {TreeNode} from 'primeng/api';
import {Constraint} from '../app/models/constraint-models/constraint';
import {TreeNodeService} from '../app/services/tree-node.service';
import {NavbarService} from '../app/services/navbar.service';
import {CategoricalAggregate} from '../app/models/aggregate-models/categorical-aggregate';
import {Observable} from 'rxjs/Observable';

describe('Integration tests for cross table ', () => {

  let resourceService: ResourceService;
  let constraintService: ConstraintService;
  let crossTableService: CrossTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        ConstraintService,
        CrossTableService,
        TreeNodeService,
        NavbarService
      ]
    });
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
    crossTableService = TestBed.get(CrossTableService);
  });

  it('should update the cross table based on tree node drop', () => {
    let selectedTreeNode: TreeNode = {};
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
    selectedTreeNode['dropMode'] = DropMode.TreeNode;
    selectedTreeNode['fullName'] = '\\Public Studies\\Oracle_1000_Patient\\Categorical_locations\\categorical_1\\';
    selectedTreeNode['icon'] = 'icon-abc';
    selectedTreeNode['label'] = 'categorical_1 (sub: 1200, obs: 1200)';
    selectedTreeNode['name'] = 'categorical_1';
    selectedTreeNode['studyId'] = 'ORACLE_1000_PATIENT';
    selectedTreeNode['type'] = 'CATEGORICAL';
    selectedTreeNode['visualAttributes'] = ['LEAF', 'ACTIVE', 'CATEGORICAL'];

    let spy1 = spyOn(resourceService, 'getAggregate').and.callFake(() => {
      let agg = new CategoricalAggregate();
      agg.valueCounts.set('heart', 10);
      agg.valueCounts.set('liver', 20);
      return Observable.of(agg);
    });
    let spy2 = spyOn(crossTableService, 'updateCells').and.callThrough();
    let spy3 = spyOn(resourceService, 'getCrossTable').and.callFake(() => {
      return Observable.of(crossTableService.crossTable);
    });
    let constraint = constraintService.generateConstraintFromTreeNode(selectedTreeNode, DropMode.TreeNode);
    crossTableService.crossTable.rowConstraints.push(constraint);
    let isValid = crossTableService.isValidConstraint(constraint);
    constraint.textRepresentation = CrossTableService.brief(constraint);
    let constraints: Constraint[] = [];
    constraints.push(constraint);
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

  it('should update the cells of the cross table when a constraint is removed', () => {

  });

});
