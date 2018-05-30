import {TestBed, inject} from '@angular/core/testing';

import {CrossTableService} from './cross-table.service';
import {ResourceService} from './resource.service';
import {ResourceServiceMock} from './mocks/resource.service.mock';
import {ConstraintService} from './constraint.service';
import {ConstraintServiceMock} from './mocks/constraint.service.mock';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Observable} from 'rxjs/Observable';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {FormatHelper} from '../utilities/FormatHelper';

describe('CrossTableService', () => {
  let crossTableService: CrossTableService;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        CrossTableService
      ]
    });
    crossTableService = TestBed.get(CrossTableService);
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
  });

  it('should be created',
    inject([CrossTableService], (service: CrossTableService) => {
      expect(service).toBeTruthy();
    }));

  it('should get crossTable', () => {
    let spy = spyOnProperty(crossTableService, 'crossTable', 'get').and.callThrough();
    expect(crossTableService.crossTable).toBeDefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should verify updateValueConstraints for categorical concept constraint',
    () => {
      let spy1 = spyOn(crossTableService.valueConstraints, 'get').and.callFake(() => {
        return [{}];
      });
      let spy2 = spyOn(crossTableService, 'updateValueConstraints').and.callThrough();
      let spy3 = spyOn(crossTableService, 'updateCells').and.stub();
      let spy4 = spyOn<any>(crossTableService, 'retrieveAggregate').and.callThrough();
      let spy5 = spyOn(constraintService, 'isCategoricalConceptConstraint').and.callFake(() => {
        return true;
      });
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
      crossTableService.updateValueConstraints([categoricalConcept]);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
      expect(spy3).toHaveBeenCalled();
      expect(spy4).toHaveBeenCalled();
      expect(spy5).toHaveBeenCalled();
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

  it('should verify updateValueConstraints for combination constraint',
    () => {
      let categoricalConcept = new ConceptConstraint();
      let concept = new Concept();
      concept.type = ConceptType.CATEGORICAL;
      categoricalConcept.concept = concept;
      let combi = new CombinationConstraint();
      combi.addChild(categoricalConcept);
      spyOn(crossTableService, 'updateCells').and.stub();
      let retrieveAggregateSpy = spyOn<any>(crossTableService, 'retrieveAggregate').and.stub();
      spyOn(combi, 'isAnd').and.callThrough();
      let catChildSpy = spyOn(constraintService, 'isCategoricalConceptConstraint').and.callThrough();
      crossTableService.updateValueConstraints([combi]);
      expect(crossTableService.updateCells).toHaveBeenCalled();
      expect(retrieveAggregateSpy).toHaveBeenCalled();
      expect(catChildSpy).toHaveBeenCalled();
      expect(constraintService.isCategoricalConceptConstraint).toHaveBeenCalled();
      expect(combi.isAnd).toHaveBeenCalled();
    });

  it('should verify updateValueConstraints for other constraint',
    () => {
      spyOn(crossTableService, 'updateCells').and.stub();
      spyOn(crossTableService.crossTable, 'addValueConstraint').and.stub();
      spyOn(constraintService, 'isCategoricalConceptConstraint').and.callFake(() => {
        return false;
      });
      crossTableService.updateValueConstraints([new TrueConstraint()]);
      expect(crossTableService.updateCells).toHaveBeenCalled();
      expect(crossTableService.crossTable.addValueConstraint).toHaveBeenCalled();
    });

  it('should update cells when value constraints are mapped', () => {
    let spy1 =
      spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get')
        .and.callFake(() => {
        return true;
      });
    let spy2 = spyOn(crossTableService.crossTable, 'updateHeaderConstraints').and.stub();
    let spy3 = spyOn(resourceService, 'getCrossTable').and.callThrough();
    crossTableService.updateCells();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
  });

  it('should check if a constraint is valid for cross table', () => {
    let categoricalConcept = new ConceptConstraint();
    let concept = new Concept();
    concept.type = ConceptType.CATEGORICAL;
    categoricalConcept.concept = concept;
    let combi = new CombinationConstraint();
    combi.addChild(categoricalConcept);
    let spy1 = spyOn(crossTableService, 'isValidConstraint').and.callThrough();
    let spy2 = spyOn(constraintService, 'isCategoricalConceptConstraint').and.callThrough();
    let spy3 =
      spyOn<any>(crossTableService, 'isConjunctiveAndHasOneCategoricalConstraint').and.callThrough();
    let result = crossTableService.isValidConstraint(combi);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(result).toBe(true);
    result = crossTableService.isValidConstraint(new TrueConstraint());
    expect(result).toBe(false);
  })

  it('should check if value constraints are mapped', function () {
    let spy1 = spyOnProperty(crossTableService, 'areValueConstraintsMapped', 'get').and.callThrough();
    let result = crossTableService.areValueConstraintsMapped;
    expect(spy1).toHaveBeenCalled();
    expect(result).toBe(true);
  })

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

  it('should get constraints', () => {
    expect(crossTableService.rowConstraints).toBe(crossTableService.crossTable.rowConstraints);
    expect(crossTableService.columnConstraints).toBe(crossTableService.crossTable.columnConstraints);
    expect(crossTableService.valueConstraints).toBe(crossTableService.crossTable.valueConstraints);
  });

  it('should get rows and cols', () => {
    expect(crossTableService.rows).toBe(crossTableService.crossTable.rows);
    expect(crossTableService.cols).toBe(crossTableService.crossTable.cols);
  });
});
