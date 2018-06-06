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
import {ValueConstraint} from '../models/constraint-models/value-constraint';
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
    let spy6 = spyOn<any>(crossTableService, 'addCategoricalValueConstraints').and.callThrough();
    let spy7 = spyOn(resourceService, 'getAggregate').and.callFake(() => {
      let aggregate: CategoricalAggregate = new CategoricalAggregate();
      aggregate.valueCounts.set('one', 1);
      aggregate.valueCounts.set('two', 2);
      aggregate.valueCounts.set(FormatHelper.nullValuePlaceholder, 3);
      return Observable.of(aggregate);
    });
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

    let aggregate: CategoricalAggregate = new CategoricalAggregate();
    aggregate.valueCounts.set('one', 1);
    aggregate.valueCounts.set('two', 2);
    aggregate.valueCounts.set(FormatHelper.nullValuePlaceholder, 3);
    categoricalConcept.concept.aggregate = aggregate;
    crossTableService.updateValueConstraints([categoricalConcept]);
    expect(spy6).toHaveBeenCalled();
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
    let result = crossTableService.isValidConstraint(combi);
    expect(spy1).toHaveBeenCalled();
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

  it('should correctly create cross constraints for a concept', () => {
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
      [{type: 'and', args: [
            {type: 'concept', conceptCode: 'foo'},
            {type: 'value', valueType: 'STRING', operator: '=', value: 'a'},
          ]}],
      [{type: 'and', args: [
            {type: 'concept', conceptCode: 'foo'},
            {type: 'value', valueType: 'STRING', operator: '=', value: 'b'},
          ]}]
    ];
    expect(crossConstraints.map(constraints =>
      constraints.map(constraint => TransmartConstraintMapper.mapConstraint(constraint)))).toEqual(expected);
    expect(crossConstraints.map(constraints =>
      constraints.map(constraint => constraint.textRepresentation))).toEqual([['a'], ['b']]);
  });

  it('should correctly create cross constraints for multiple concepts', () => {
    // Prepare input
    let conceptFoo = new Concept();
    conceptFoo.type = ConceptType.CATEGORICAL;
    conceptFoo.code = 'foo';
    let fooConstraint = new ConceptConstraint();
    fooConstraint.concept = conceptFoo;
    let conceptBar = new Concept();
    conceptBar.type = ConceptType.CATEGORICAL;
    conceptBar.code = 'bar';
    let barConstraint = new ConceptConstraint();
    barConstraint.concept = conceptBar;

    let fooValueConstraints: ValueConstraint[] = [new ValueConstraint()];
    fooValueConstraints[0].value = 'a';
    fooValueConstraints[0].valueType = 'STRING';
    fooValueConstraints[0].operator = '=';
    let barValueConstraints: ValueConstraint[] = [new ValueConstraint(), new ValueConstraint()];
    barValueConstraints[0].value = 'x';
    barValueConstraints[0].valueType = 'STRING';
    barValueConstraints[0].operator = '=';
    barValueConstraints[1].value = 'y';
    barValueConstraints[1].valueType = 'STRING';
    barValueConstraints[1].operator = '=';

    let crossTable = crossTableService.crossTable;
    crossTable.rowConstraints.push(fooConstraint);
    crossTable.addValueConstraints(fooConstraint, fooValueConstraints);
    crossTable.rowConstraints.push(barConstraint);
    crossTable.addValueConstraints(barConstraint, barValueConstraints);
    let crossConstraints = crossTableService.crossConstraints(crossTable.rowConstraints);

    let expected = [
      [
        {type: 'and', args: [
              {type: 'concept', conceptCode: 'foo'},
              {type: 'value', valueType: 'STRING', operator: '=', value: 'a'},
            ]},
        {type: 'and', args: [
              {type: 'concept', conceptCode: 'bar'},
              {type: 'value', valueType: 'STRING', operator: '=', value: 'x'},
            ]}
      ],
      [
          {type: 'and', args: [
                {type: 'concept', conceptCode: 'foo'},
                {type: 'value', valueType: 'STRING', operator: '=', value: 'a'},
              ]},
          {type: 'and', args: [
                {type: 'concept', conceptCode: 'bar'},
                {type: 'value', valueType: 'STRING', operator: '=', value: 'y'},
              ]}
        ]
    ];
    expect(crossConstraints.map(constraints =>
        constraints.map(constraint => TransmartConstraintMapper.mapConstraint(constraint)))).toEqual(expected);
    expect(crossConstraints.map(constraints =>
        constraints.map(constraint => constraint.textRepresentation))).toEqual(
          [['a', 'x'], ['a', 'y']]);
  });

});
