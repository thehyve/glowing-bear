/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TreeNodeService} from './tree-node.service';
import {ConstraintService} from './constraint.service';
import {Concept} from '../models/constraint-models/concept';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {of as observableOf} from 'rxjs';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHelper} from '../utilities/error-helper';
import {ConceptType} from '../models/constraint-models/concept-type';
import {MessageHelper} from '../utilities/message-helper';
import {CountItem} from '../models/aggregate-models/count-item';
import {throwError} from 'rxjs/internal/observable/throwError';
import {CountService} from './count.service';
import {CountServiceMock} from './mocks/count.service.mock';
import {GbTreeNode} from '../models/tree-node-models/gb-tree-node';
import {VisualAttribute} from '../models/tree-node-models/visual-attribute';
import {StudyConstraint} from '../models/constraint-models/study-constraint';
import {Study} from '../models/constraint-models/study';
import {
  ExtendedAndConstraint,
  ExtendedStudyNameConstraint,
  TransmartStudyNameConstraint
} from '../models/transmart-models/transmart-constraint';
import {ConstraintSerialiser} from '../utilities/constraint-utilities/constraint-serialiser';

describe('TreeNodeService', () => {
  let treeNodeService: TreeNodeService;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;
  let countService: CountService;
  let httpErrorResponse: HttpErrorResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: CountService,
          useClass: CountServiceMock
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
    countService = TestBed.get(CountService);
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
  });

  it('should handle error for the initial loading of tree nodes', () => {
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return throwError(httpErrorResponse);
    });
    let spy2 = spyOn(ErrorHelper, 'handleError').and.stub();
    treeNodeService.loadTreeNodes();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should iteratively load the next tree branch', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    };
    let otherNode = {
      fullName: 'other full name'
    };
    let spy1 = spyOn(resourceService, 'getTreeNodes')
      .and.callFake((fullname, depth, hasCounts, hasTag) => {
        if (fullname === parentFullName) {
          return observableOf([parentNode]);
        }
        return observableOf([otherNode]);
      });
    let spy2 = spyOn(treeNodeService, 'getTreeNodeDescendantsWithDepth')
      .and.callFake((refNode, depth, descendants) => {
        if (refNode['fullName'] === parentFullName) {
          descendants.push({});
          descendants.push({});
        }
      });
    let spy3 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    let spy4 = spyOn(treeNodeService, 'processTreeNodes').and.stub();
    let spy5 = spyOn(treeNodeService, 'loadTreeNext').and.callThrough();
    treeNodeService.loadTreeNext(parentNode, constraintService);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy5).toHaveBeenCalledTimes(3);
  });

  it('should handle edge cases of iterative tree loading', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    };
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
  });

  it('should handle error for iterative tree loading', () => {
    let parentFullName = 'parent-full-name';
    let parentNode = {
      fullName: parentFullName,
      children: [
        {}
      ]
    };
    let spy1 = spyOn(resourceService, 'getTreeNodes').and.callFake(() => {
      return throwError(httpErrorResponse);
    });
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
  });

  it('should process tree nodes', () => {
    let node1 = {
      children: undefined
    };
    let node = {
      children: [node1]
    };
    let spy1 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    treeNodeService.processTreeNodes([node], constraintService);
    expect(spy1).toHaveBeenCalledTimes(2);
  });

  it('should handle edge case for processing tree nodes', () => {
    let spy1 = spyOn(treeNodeService, 'processTreeNode').and.stub();
    treeNodeService.processTreeNodes(null, constraintService);
    expect(spy1).toHaveBeenCalledTimes(0);
  });

  it('should process a single tree node', () => {
    // construct the maps
    countService.conceptCountMap = new Map<string, CountItem>();
    countService.conceptCountMap.set('concept1', new CountItem(10, 20));
    countService.conceptCountMap.set('concept2', new CountItem(30, 110));
    countService.conceptCountMap.set('concept3', new CountItem(70, 90));

    let map1 = new Map<string, CountItem>();
    let item1 = new CountItem(10, 20);
    map1.set('concept1', item1);
    let map2 = new Map<string, CountItem>();
    let item2 = new CountItem(30, 110);
    let item3 = new CountItem(70, 90);
    map2.set('concept2', item2);
    map2.set('concept3', item3);
    countService.studyConceptCountMap = new Map<string, Map<string, CountItem>>();
    countService.studyConceptCountMap.set('study1', map1);
    countService.studyConceptCountMap.set('study2', map2);

    countService.studyCountMap = new Map<string, CountItem>();
    countService.studyCountMap.set('study1', new CountItem(10, 20));
    countService.studyCountMap.set('study2', new CountItem(100, 200));

    let node: GbTreeNode = {
      label: 'label',
      fullName: 'full name',
      name: 'name',
      conceptCode: 'concept2',
      type: ConceptType.DATE,
      constraint: {
        type: 'concept',
        conceptCode: 'concept2'
      },
      visualAttributes: [
        VisualAttribute.LEAF,
        VisualAttribute.DATE
      ],
      metadata: 1
    };

    treeNodeService.processTreeNode(node, constraintService);
    expect(node.label).toContain('ⓘ');
    expect(node.constraint.fullName).toEqual('full name');
    expect(node.constraint.name).toEqual('name');
    expect(node.constraint.conceptCode).toEqual('concept2');
    expect(node.constraint.valueType).toEqual(ConceptType.DATE);
    expect(constraintService.concepts.length).toBe(1);
    expect(constraintService.conceptConstraints.length).toBe(1);
    expect(constraintService.allConstraints.length).toBe(1);

    node.type = 'NUMERIC';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.icon).toBeDefined();
    node.type = 'HIGH_DIMENSIONAL';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.icon).toBeDefined();
    node.type = 'CATEGORICAL';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.icon).toBeDefined();
    node.type = 'DATE';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.icon).toBeDefined();
    node.type = 'TEXT';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.icon).toBeDefined();

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

    node.studyId = 'study2';
    treeNodeService.processTreeNode(node, constraintService);

    node.visualAttributes = [VisualAttribute.FOLDER];
    node.metadata = undefined;
    node.children = [{}];
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.constraint).not.toBeDefined();
    expect(constraintService.concepts.length).toBe(0);
    expect(constraintService.conceptConstraints.length).toBe(0);
    expect(constraintService.allConstraints.length).toBe(0);
    expect(node.label).not.toContain('ⓘ');

    node.visualAttributes = [VisualAttribute.FOLDER];
    node.type = 'UNKNOWN';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.expandedIcon).toBeDefined();
    expect(node.collapsedIcon).toBeDefined();
    node.type = 'STUDY';
    treeNodeService.processTreeNode(node, constraintService);
    expect(node.expandedIcon).toBeDefined();
    expect(node.collapsedIcon).toBeDefined();
  });

  it('should get concept from a tree node', () => {
    let node: GbTreeNode = {};
    node.name = 'name';
    node.fullName = '\\full\\name\\';
    node.conceptCode = 'code';
    node.type = 'NUMERIC';
    let concept = treeNodeService.getConceptFromTreeNode(node);
    expect(concept.label).toEqual('name (\\full)');
    expect(concept.type).toEqual(ConceptType.NUMERICAL);
    expect(concept.code).toEqual('code');
    expect(concept.fullName).toEqual('\\full\\name\\');
    expect(concept.name).toEqual('name');
    expect(concept.subjectDimensions.length).toEqual(0);

    node['metadata'] = {subject_dimension: 'bar'};
    concept = treeNodeService.getConceptFromTreeNode(node);
    expect(concept.subjectDimensions.length).toEqual(1);
    expect(concept.subjectDimensions[0]).toEqual('bar');

    node.type = undefined;
    let spy = spyOn(MessageHelper, 'alert').and.stub();
    concept = treeNodeService.getConceptFromTreeNode(node);
    expect(spy).toHaveBeenCalled();
    expect(concept).toBeNull();
  });

  it('should convert categorical tree node to concept constraint', () => {
    const conceptNode: GbTreeNode = {
      type: 'CATEGORICAL',
      name: 'Test categorical concept',
      fullName: '\\Test\\Test categorical concept\\',
      conceptCode: 'TEST:CAT1',
      constraint: {type: 'concept', conceptCode: 'TEST:CAT1'},
      visualAttributes: [VisualAttribute.LEAF, VisualAttribute.CATEGORICAL]
    };
    const constraint = treeNodeService.generateConstraintFromTreeNode(conceptNode);
    const expected = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST:CAT1';
    concept.type = ConceptType.CATEGORICAL;
    concept.name = 'Test categorical concept';
    concept.fullName = '\\Test\\Test categorical concept\\';
    concept.label = 'Test categorical concept (\\Test)';
    expected.concept = concept;
    expect(ConstraintSerialiser.serialise(constraint)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('should convert numerical tree node to concept constraint', () => {
    const conceptNode: GbTreeNode = {
      type: 'NUMERIC',
      name: 'Test numerical concept',
      fullName: '\\Test\\Test numerical concept\\',
      conceptCode: 'TEST:NUM1',
      constraint: {type: 'concept', conceptCode: 'TEST:NUM1'},
      visualAttributes: [VisualAttribute.LEAF, VisualAttribute.NUMERICAL]
    };
    const constraint = treeNodeService.generateConstraintFromTreeNode(conceptNode);
    const expected = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST:NUM1';
    concept.type = ConceptType.NUMERICAL;
    concept.name = 'Test numerical concept';
    concept.fullName = '\\Test\\Test numerical concept\\';
    concept.label = 'Test numerical concept (\\Test)';
    expected.concept = concept;
    expect(ConstraintSerialiser.serialise(constraint)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('should convert date tree node to concept constraint', () => {
    const conceptNode: GbTreeNode = {
      type: 'DATE',
      name: 'Test date concept',
      fullName: '\\Test\\Test date concept\\',
      conceptCode: 'TEST:DATE1',
      constraint: {type: 'concept', conceptCode: 'TEST:DATE1'},
      visualAttributes: [VisualAttribute.LEAF, VisualAttribute.DATE]
    };
    const constraint = treeNodeService.generateConstraintFromTreeNode(conceptNode);
    const expected = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST:DATE1';
    concept.type = ConceptType.DATE;
    concept.name = 'Test date concept';
    concept.fullName = '\\Test\\Test date concept\\';
    concept.label = 'Test date concept (\\Test)';
    expected.concept = concept;
    expect(ConstraintSerialiser.serialise(constraint)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('should convert study node to study constraint', () => {
    const studyNode: GbTreeNode = {
      type: 'STUDY',
      name: 'Test study',
      fullName: '\\Test\\Study\\',
      studyId: 'TEST_STUDY_ID',
      constraint: {type: 'study_name', studyId: 'TEST_STUDY_ID'} as ExtendedStudyNameConstraint,
      visualAttributes: [VisualAttribute.STUDY, VisualAttribute.FOLDER]
    };
    const constraint = treeNodeService.generateConstraintFromTreeNode(studyNode);
    const expected = new StudyConstraint();
    const study = new Study();
    study.id = 'TEST_STUDY_ID';
    expected.studies.push(study);
    expect(ConstraintSerialiser.serialise(constraint)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('should convert study specific concept node to concept constraint with study', () => {
    const conceptNode: GbTreeNode = {
      type: 'CATEGORICAL',
      name: 'Test categorical concept',
      fullName: '\\Test\\Study\\Test categorical concept\\',
      conceptCode: 'TEST:CAT1',
      studyId: 'TEST_STUDY_ID',
      constraint: {
        type: 'and',
        args: [
          {type: 'concept', conceptCode: 'TEST:CAT1'},
          {type: 'study_name', studyId: 'TEST_STUDY_ID'} as TransmartStudyNameConstraint
        ]
      } as ExtendedAndConstraint,
      visualAttributes: [VisualAttribute.LEAF, VisualAttribute.CATEGORICAL]
    };
    const constraint = treeNodeService.generateConstraintFromTreeNode(conceptNode);
    const expected = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST:CAT1';
    concept.type = ConceptType.CATEGORICAL;
    concept.name = 'Test categorical concept';
    concept.fullName = '\\Test\\Study\\Test categorical concept\\';
    concept.label = 'Test categorical concept (\\Test\\Study)';
    expected.concept = concept;
    const studyConstraint = new StudyConstraint();
    const study = new Study();
    study.id = 'TEST_STUDY_ID';
    studyConstraint.studies.push(study);
    expected.studyConstraint = studyConstraint;
    expected.applyStudyConstraint = true;
    expect(ConstraintSerialiser.serialise(constraint)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('should get tree node descendants with given depth', () => {
    let node_1_1 = {};
    let node_1 = {
      children: [node_1_1]
    };
    let node = {
      children: [node_1]
    };
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
  });

  it('should get tree nodes descendants with given excluded types', () => {
    let node_1_1 = {
      type: 'node_1_1_type'
    };
    let node_1 = {
      children: [node_1_1],
      type: 'node_1_type'
    };
    let node = {
      children: [node_1]
    };
    let desc = [];
    let types = ['type1'];
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
  });


  it('should convert tree nodes to paths', () => {
    let nodeABC: GbTreeNode = {};
    nodeABC.fullName = '\\A\\B\\C\\';
    nodeABC.metadata = {};
    nodeABC.metadata['item_name'] = 'name3';
    let nodeAB: GbTreeNode = {};
    nodeAB.fullName = '\\A\\B\\';
    nodeAB.children = [nodeABC];
    let nodeADE: GbTreeNode = {};
    nodeADE.fullName = '\\A\\D\\E\\';
    nodeADE.metadata = {};
    nodeADE.metadata['item_name'] = 'name1';
    let nodeADEF: GbTreeNode = {};
    nodeADEF.fullName = '\\A\\D\\E\\F\\';
    nodeADE.children = [nodeADEF];
    let nodeAD: GbTreeNode = {};
    nodeAD.fullName = '\\A\\D\\';
    nodeAD.children = [nodeADE];
    let nodeA: GbTreeNode = {};
    nodeA.fullName = '\\A\\';
    nodeA.children = [nodeAB, nodeAD];
    let paths = [];
    treeNodeService.convertItemsToPaths([nodeA, null], ['name1'], paths);
    expect(paths.length).toBe(1);
    expect(paths[0]).toBe('\\A\\D\\E\\');
  });

  it('should update tree nodes counts', () => {
    let node1: GbTreeNode = {};
    node1.name = 'one';
    node1.subjectCount = '11';
    node1.metadata = {foo: 'bar'};
    let node2: GbTreeNode = {};
    node2.name = 'two';
    node2.subjectCount = '12';
    let node3: GbTreeNode = {};
    node2.children = [node3];
    spyOnProperty(treeNodeService, 'treeNodes', 'get').and.returnValue([node1, node2]);
    treeNodeService.updateTreeNodeCounts();
    expect(node1.label).toContain('ⓘ');
    expect(node1.label).toContain('11');
    expect(node2.label).toContain('12');
  });

});
