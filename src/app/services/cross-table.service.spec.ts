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
import {CategoricalAggregate} from '../models/aggregate-models/categorical-aggregate';
import {FormatHelper} from '../utilities/format-helper';
import {CombinationState} from '../models/constraint-models/combination-state';
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

  it('should check if value constraints are mapped', function () {
    let spy1 = spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get').and.callThrough();
    let result = crossTableService.areValueConstraintsMapped;
    expect(spy1).toHaveBeenCalled();
    expect(result).toBe(true);

    let dummy = new TrueConstraint();
    crossTableService.rowConstraints.length = 0;
    crossTableService.rowConstraints.push(dummy);
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(false);

    crossTableService.valueConstraints.set(dummy, []);
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(true);

    crossTableService.rowConstraints.length = 0;
    crossTableService.columnConstraints.length = 0;
    crossTableService.columnConstraints.push(dummy);
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(true);

    crossTableService.valueConstraints.clear();
    result = crossTableService.areValueConstraintsMapped;
    expect(result).toBe(false);
  });

  it('should verify updateValueConstraints for categorical concept constraint', () => {
    let spy1 = spyOn(crossTableService.valueConstraints, 'get').and.callFake(() => {
      return [{}];
    });
    let spy2 = spyOn(crossTableService, 'updateValueConstraints').and.callThrough();
    let spy3 = spyOn(crossTableService, 'updateCells').and.stub();
    let spy4 = spyOn<any>(crossTableService, 'retrieveAggregate').and.callThrough();
    let spy6 = spyOn<any>(crossTableService, 'setCategoricalValueConstraints').and.callThrough();
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
    crossTableService.updateValueConstraints([combi]);
    expect(crossTableService.updateCells).toHaveBeenCalled();
    expect(retrieveAggregateSpy).toHaveBeenCalled();
    expect(combi.isAnd).toHaveBeenCalled();

    combi.addChild(new TrueConstraint());
    crossTableService.columnConstraints.push(combi);
    crossTableService.updateValueConstraints([combi]);
    expect(retrieveAggregateSpy).toHaveBeenCalled();

    combi.addChild(categoricalConcept);
    crossTableService.updateValueConstraints([combi]);

    combi.combinationState = CombinationState.Or;
    crossTableService.updateValueConstraints([combi]);
  });

  it('should verify updateValueConstraints for other constraint', () => {
    spyOn(crossTableService, 'updateCells').and.stub();
    let constraint = new TrueConstraint();
    crossTableService.rowConstraints.push(constraint);
    crossTableService.updateValueConstraints([constraint]);
    expect(crossTableService.updateCells).toHaveBeenCalled();
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
