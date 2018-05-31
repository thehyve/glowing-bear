import {TestBed, inject} from '@angular/core/testing';

import {CrossTableService} from './cross-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Observable} from 'rxjs/Observable';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {FormatHelper} from '../utilities/format-helper';
import {CombinationState} from '../models/constraint-models/combination-state';
import {Constraint} from '../models/constraint-models/constraint';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import Spy = jasmine.Spy;
import {TransmartResourceService} from './transmart-services/transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';
import {TransmartCrossTable} from '../models/transmart-models/transmart-cross-table';
import {TransmartConstraintMapper} from '../utilities/transmart-utilities/transmart-constraint-mapper';

describe('CrossTableService', () => {
  let crossTableService: CrossTableService;
  let resourceService: ResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        CrossTableService
      ]
    });
    crossTableService = TestBed.get(CrossTableService);
    resourceService = TestBed.get(ResourceService);
  });

  it('should be created',
    inject([CrossTableService], (service: CrossTableService) => {
      expect(service).toBeTruthy();
  }));

  it('should verify updateValueConstraints for categorical concept constraint', () => {
    let spy1 = spyOn(crossTableService.valueConstraints, 'get').and.callFake(() => {
      return [{}];
    });
    let spy2 = spyOn(crossTableService, 'updateValueConstraints').and.callThrough();
    let spy3 = spyOn(crossTableService, 'updateCells').and.stub();
    let spy4 = spyOn<any>(crossTableService, 'retrieveAggregate').and.callThrough();
    let spy6 = spyOn<any>(crossTableService, 'composeCategoricalValueConstraints').and.callThrough();
    let spy7 = spyOn(resourceService, 'getAggregate').and.callFake(() => {
      let aggregate: CategoricalAggregate = new CategoricalAggregate();
      aggregate.valueCounts.set('one', 1);
      aggregate.valueCounts.set('two', 2);
      aggregate.valueCounts.set(FormatHelper.nullValuePlaceholder, 3);
      return Observable.of(aggregate);
    });
    let spy8 = spyOn<any>(crossTableService, 'adjustCombinationConstraintTextRepresentation').and.callThrough();
    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    crossTableService.rowConstraints.push(categoricalConcept);
    crossTableService.updateValueConstraints([categoricalConcept]);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy6).toHaveBeenCalled();
    expect(spy7).toHaveBeenCalled();
    expect(spy8).toHaveBeenCalled();

    let aggregate: CategoricalAggregate = new CategoricalAggregate();
    aggregate.valueCounts.set('one', 1);
    aggregate.valueCounts.set('two', 2);
    aggregate.valueCounts.set(FormatHelper.nullValuePlaceholder, 3);
    categoricalConcept.concept.aggregate = aggregate;
    crossTableService.updateValueConstraints([categoricalConcept]);
    expect(spy6).toHaveBeenCalled();
  });

  it('should adjust combination constraint text representation', () => {
    let combi = new CombinationConstraint();
    combi.addChild(new TrueConstraint());
    let spy1 = spyOn(crossTableService, 'adjustCombinationConstraintTextRepresentation').and.callThrough();
    let description = crossTableService.adjustCombinationConstraintTextRepresentation(combi);
    expect(spy1).toHaveBeenCalled();
    expect(description).toBe(combi.textRepresentation);

    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    combi.addChild(categoricalConcept);
    description = crossTableService.adjustCombinationConstraintTextRepresentation(combi);
    expect(description).toBe(categoricalConcept.textRepresentation);
  });

  it('should verify updateValueConstraints for combination constraint', () => {
    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    let combi = new CombinationConstraint();
    combi.addChild(categoricalConcept);
    spyOn(crossTableService, 'updateCells').and.stub();
    let retrieveAggregateSpy = spyOn<any>(crossTableService, 'retrieveAggregate').and.stub();
    spyOn(combi, 'isAnd').and.callThrough();
    let addValSpy = spyOn(crossTableService.crossTable, 'addValueConstraints').and.stub();
    crossTableService.updateValueConstraints([combi]);
    expect(crossTableService.updateCells).toHaveBeenCalled();
    expect(retrieveAggregateSpy).toHaveBeenCalled();
    expect(combi.isAnd).toHaveBeenCalled();

    combi.addChild(new TrueConstraint());
    crossTableService.updateValueConstraints([combi]);
    expect(retrieveAggregateSpy).toHaveBeenCalled();

    combi.addChild(categoricalConcept);
    crossTableService.updateValueConstraints([combi]);
    expect(addValSpy).toHaveBeenCalled();

    combi.combinationState = CombinationState.Or;
    crossTableService.updateValueConstraints([combi]);
    expect(addValSpy).toHaveBeenCalled();
  });

  it('should verify updateValueConstraints for other constraint', () => {
    spyOn(crossTableService, 'updateCells').and.stub();
    spyOn(crossTableService.crossTable, 'addValueConstraints').and.stub();
    let constraint = new TrueConstraint();
    crossTableService.rowConstraints.push(constraint);
    crossTableService.updateValueConstraints([constraint]);
    expect(crossTableService.updateCells).toHaveBeenCalled();
    expect(crossTableService.crossTable.addValueConstraints).toHaveBeenCalled();
  });

  it('should update cells when value constraints are mapped', () => {
    let spy1 =
      spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get')
        .and.callFake(() => {
        return true;
      });
    let spy2 = spyOn(crossTableService, 'updateHeaderConstraints').and.stub();
    let spy3 = spyOn(resourceService, 'getCrossTable').and.callThrough();
    crossTableService.updateCells();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should pause updating cells when value constraints are not mapped', () => {
    let spy1 =
      spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get')
        .and.callFake(() => {
        return false;
      });
    let spy2 = spyOn(window, 'setTimeout').and.stub();
    crossTableService.updateCells();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('should check if a constraint is valid for cross table', () => {
    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    let combi = new CombinationConstraint();
    combi.addChild(categoricalConcept);
    combi.addChild(new TrueConstraint());
    let spy1 = spyOn(crossTableService, 'isValidConstraint').and.callThrough();
    let spy3 =
      spyOn<any>(crossTableService, 'isConjunctiveAndHasOneCategoricalConstraint').and.callThrough();
    let result = crossTableService.isValidConstraint(combi);
    expect(spy1).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(result).toBe(true);
    result = crossTableService.isValidConstraint(new TrueConstraint());
    expect(result).toBe(false);

    combi.addChild(categoricalConcept);
    result = crossTableService.isValidConstraint(combi);
    expect(result).toBe(false);

    combi.combinationState = CombinationState.Or;
    result = crossTableService.isValidConstraint(combi);
    expect(result).toBe(false);
  });

  it('should check if value constraints are mapped', function () {
    let spy1 = spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get').and.callThrough();
    let result = crossTableService.areValueConstraintsMapped;
    expect(spy1).toHaveBeenCalled();
    expect(result).toBe(true);

    let dummy = new TrueConstraint();
    crossTableService.crossTable.rowConstraints = [dummy];
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(false);

    crossTableService.crossTable.valueConstraints.set(dummy, []);
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(true);

    crossTableService.crossTable.rowConstraints = [];
    crossTableService.crossTable.columnConstraints = [dummy];
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(true);

    crossTableService.crossTable.valueConstraints.clear();
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(false);
  });

  it('should get and set selectedConstraintCell', () => {
    let spyGet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'get').and.callThrough();
    let spySet =
      spyOnProperty(crossTableService, 'selectedConstraintCell', 'set').and.callThrough();
    crossTableService.selectedConstraintCell = null;
    expect(crossTableService.selectedConstraintCell).toBe(null);
    expect(spyGet).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalled();
  });

});


function combineCategoricalValueConstraints(conceptCode1: string, value1: string, conceptCode2, value2: string): any {
  return {
    type: 'and', args: [
      {
        type: 'subselection', dimension: 'patient', constraint: {
          type: 'and', args: [
            {type: 'concept', conceptCode: conceptCode1},
            {type: 'value', valueType: 'STRING', operator: '=', value: value1}
          ]
        }
      },
      {
        type: 'subselection', dimension: 'patient', constraint: {
          type: 'and', args: [
            {type: 'concept', conceptCode: conceptCode2},
            {type: 'value', valueType: 'STRING', operator: '=', value: value2}
          ]
        }
      },
    ]
  };
}


const mapConstraint = TransmartConstraintMapper.mapConstraint;

describe('Test cross table retrieval calls for TranSMART', () => {
  let crossTableService: CrossTableService;
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;
  let aggregateCall: Spy, crossTableCall: Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
        ResourceService,
        CrossTableService
      ]
    });
    transmartResourceService = TestBed.get(TransmartResourceService);
    resourceService = TestBed.get(ResourceService);
    crossTableService = TestBed.get(CrossTableService);

    aggregateCall = spyOn(resourceService, 'getAggregate')
      .and.callFake((constraint: ConceptConstraint) => {
        let aggregate: CategoricalAggregate = new CategoricalAggregate();
        switch (constraint.concept.code) {
          case 'foo':
            aggregate.valueCounts.set('one', 1);
            aggregate.valueCounts.set('two', 2);
            return Observable.of(aggregate);
          case 'bar':
            aggregate.valueCounts.set('A', 3);
            aggregate.valueCounts.set('B', 4);
            return Observable.of(aggregate);
          default:
            throw new Error('No mock data for the concept');
        }
    });
  });

  it('should correctly create cross constraints for concepts', () => {
    // Prepare input
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    concept.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = concept;

    let valueConstraints: ValueConstraint[] = [new ValueConstraint(), new ValueConstraint()];
    valueConstraints[0].value = 'a';
    valueConstraints[0].valueType = 'STRING';
    valueConstraints[0].operator = '=';
    valueConstraints[1].value = 'b';
    valueConstraints[1].valueType = 'STRING';
    valueConstraints[1].operator = '=';

    let crossTable = crossTableService.crossTable;
    crossTable.rowConstraints.push(fooConstraint);
    crossTable.addValueConstraints(fooConstraint, valueConstraints);
    let crossConstraints = crossTableService.crossConstraints(crossTable.rowConstraints);

    let expected = [
      {type: 'value', valueType: 'STRING', operator: '=', value: 'a'},
      {type: 'value', valueType: 'STRING', operator: '=', value: 'b'}
    ];
    expect(crossConstraints.map(constraint => mapConstraint(constraint))).toEqual(expected);
  });

  it('should retrieve the cross table when adding a concept to the row constraints', () => {
    // Prepare input
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    concept.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = concept;

    // Expected row constraints, to be generated by the service
    let expectedRowConstraints = [
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'one'},
        ]},
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'two'},
        ]}
    ];

    // Prepare checks
    crossTableCall = spyOn(transmartResourceService, 'getCrossTable').and.callFake(
      (baseConstraint: Constraint, rowConstraints: Constraint[], columnConstraints: Constraint[]) => {
        expect(mapConstraint(baseConstraint)).toEqual({type: 'true'});
        expect(rowConstraints.map(constraint => mapConstraint(constraint))).toEqual(expectedRowConstraints);
        expect(columnConstraints.map(constraint => mapConstraint(constraint))).toEqual([{type: 'true'}]);
        let result = new TransmartCrossTable();
        result.rows = [[1], [2]];
        return Observable.of(result);
      });

    // Call the service
    crossTableService.crossTable.rowConstraints.push(fooConstraint);
    crossTableService.updateValueConstraints([fooConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled();
  });

  it('should retrieve the cross table when adding multiple concepts to the row constraints', () => {
    // Prepare input
    let fooConcept = new Concept();
    fooConcept.type = ConceptType.CATEGORICAL;
    fooConcept.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = fooConcept;
    let barConcept = new Concept();
    barConcept.type = ConceptType.CATEGORICAL;
    barConcept.code = 'bar';
    let barConstraint = new ConceptConstraint();
    barConstraint.concept = barConcept;

    // Expected row constraints for one concept, to be generated by the service
    let expectedRowConstraints = [
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'one'},
        ]},
      {type: 'and', args: [
          {type: 'concept', conceptCode: 'foo'},
          {type: 'value', valueType: 'STRING', operator: '=', value: 'two'},
        ]}
    ];
    // Dummy result for two rows
    let testRows = [[1], [2]];

    // Prepare checks for the first call
    crossTableCall = spyOn(transmartResourceService, 'getCrossTable').and.callFake(
      (baseConstraint: Constraint, rowConstraints: Constraint[], columnConstraints: Constraint[]) => {
        expect(mapConstraint(baseConstraint)).toEqual({type: 'true'});
        expect(rowConstraints.map(constraint => mapConstraint(constraint))).toEqual(expectedRowConstraints);
        expect(columnConstraints.map(constraint => mapConstraint(constraint))).toEqual([{type: 'true'}]);
        let result = new TransmartCrossTable();
        result.rows = testRows;
        return Observable.of(result);
      });

    // Call the service
    crossTableService.crossTable.rowConstraints.push(fooConstraint);
    crossTableService.updateValueConstraints([fooConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled();

    // Expected row constraints for two concepts, to be generated by the service
    expectedRowConstraints = [
      combineCategoricalValueConstraints('foo', 'one', 'bar', 'A'),
      combineCategoricalValueConstraints('foo', 'one', 'bar', 'B'),
      combineCategoricalValueConstraints('foo', 'two', 'bar', 'A'),
      combineCategoricalValueConstraints('foo', 'two', 'bar', 'B'),
    ];
    // Dummy result for four rows
    testRows = [[1], [2], [3], [4]];

    crossTableService.crossTable.rowConstraints.push(barConstraint);
    crossTableService.updateValueConstraints([barConstraint]);

    expect(aggregateCall).toHaveBeenCalled();
    expect(crossTableCall).toHaveBeenCalled()
  });

});
