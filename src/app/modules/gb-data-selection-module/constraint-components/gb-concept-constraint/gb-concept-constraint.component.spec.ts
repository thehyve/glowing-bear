import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConceptConstraintComponent} from './gb-concept-constraint.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule, MultiSelectModule, PanelModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {Concept} from '../../../../models/constraint-models/concept';
import {Observable} from 'rxjs/Observable';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {ErrorHelper} from '../../../../utilities/error-helper';
import {Error} from 'tslint/lib/error';
import {NumericalAggregate} from '../../../../models/aggregate-models/numerical-aggregate';
import {ValueConstraint} from '../../../../models/constraint-models/value-constraint';
import {GbConceptOperatorState} from './gb-concept-operator-state';
import {CategoricalAggregate} from '../../../../models/aggregate-models/categorical-aggregate';
import {TimeConstraint} from '../../../../models/constraint-models/time-constraint';
import {DateOperatorState} from '../../../../models/constraint-models/date-operator-state';
import {UIHelper} from '../../../../utilities/ui-helper';

describe('GbConceptConstraintComponent', () => {
  let component: GbConceptConstraintComponent;
  let fixture: ComponentFixture<GbConceptConstraintComponent>;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConceptConstraintComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        PanelModule,
        MultiSelectModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbConceptConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new ConceptConstraint();
    resourceService = TestBed.get(ResourceService);
    constraintService = TestBed.get(ConstraintService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the numeric concept constraint', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = null;
    component.constraint = constraint;
    let dummyAggregate = {};
    let dummyTrialVistis = [];
    let dummyConcept = new Concept();
    let spy1 = spyOn(resourceService, 'getAggregate').and.returnValue(Observable.of(dummyAggregate));
    let spy2 = spyOn(resourceService, 'getTrialVisits').and.returnValue(Observable.of(dummyTrialVistis));
    component.initializeConstraints();
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    let spy3 = spyOn(component, 'handleNumericAggregate').and.stub();
    let spy4 = spyOn(component, 'handleCategoricalAggregate').and.stub();
    let spy5 = spyOn(component, 'handleDateAggregate').and.stub();
    dummyConcept.type = ConceptType.NUMERICAL;
    constraint.concept = dummyConcept;
    component.initializeConstraints();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).not.toHaveBeenCalled();
  })


  it('should initialize the categorical concept constraint', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    constraint.concept.type = ConceptType.CATEGORICAL;
    component.constraint = constraint;
    let spy3 = spyOn(component, 'handleNumericAggregate').and.stub();
    let spy4 = spyOn(component, 'handleCategoricalAggregate').and.stub();
    let spy5 = spyOn(component, 'handleDateAggregate').and.stub();

    component.initializeConstraints();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(spy5).not.toHaveBeenCalled();
  })

  it('should initialize the date concept constraint', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    constraint.concept.type = ConceptType.DATE;
    component.constraint = constraint;
    let spy3 = spyOn(component, 'handleNumericAggregate').and.stub();
    let spy4 = spyOn(component, 'handleCategoricalAggregate').and.stub();
    let spy5 = spyOn(component, 'handleDateAggregate').and.stub();

    component.initializeConstraints();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).toHaveBeenCalled();
  })

  it('should not initialize the constraint when it not numerical, categorical or date', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    constraint.concept.type = null;
    component.constraint = constraint;
    let spy3 = spyOn(component, 'handleNumericAggregate').and.stub();
    let spy4 = spyOn(component, 'handleCategoricalAggregate').and.stub();
    let spy5 = spyOn(component, 'handleDateAggregate').and.stub();

    component.initializeConstraints();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    expect(spy5).not.toHaveBeenCalled();
  })

  it('should handle resource service errors during initialization', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    let spy = spyOn(ErrorHelper, 'handleError').and.stub();
    spyOn(resourceService, 'getAggregate').and.callFake(() => {
      return Observable.throw('error');
    });
    spyOn(resourceService, 'getTrialVisits').and.callFake(() => {
      return Observable.throw('error');
    });
    component.initializeConstraints();
    expect(spy).toHaveBeenCalledTimes(2);
  })

  it('should handle numeric aggregate response', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    let response = new NumericalAggregate();
    response.min = 10;
    response.max = 20;
    component.handleNumericAggregate(response);
    expect(component.minLimit).toEqual(10);
    expect(component.maxLimit).toEqual(20);


    let val1 = new ValueConstraint();
    val1.operator = '>';
    val1.value = 11;
    let val2 = new ValueConstraint();
    val2.operator = '<';
    val2.value = 100;
    let val3 = new ValueConstraint();
    val3.operator = '=';
    val3.value = 15;
    let val4 = new ValueConstraint();
    val4.operator = 'other';
    val4.value = 16;
    constraint.valueConstraints = [
      val1, val2, val3, val4
    ];
    component.handleNumericAggregate(response);
    expect(component.minVal).toEqual(11);
    expect(component.maxVal).toEqual(100);
    expect(component.equalVal).toEqual(15);
    expect(component.operatorState).toEqual(GbConceptOperatorState.EQUAL);
  })

  it('should handle categorical aggregate response', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    let response = new CategoricalAggregate();
    response.valueCounts.set('foo', 10);
    response.valueCounts.set('bar', 20);

    component.handleCategoricalAggregate(response);
    expect(component.suggestedCategories.length).toBe(2);
    expect(component.selectedCategories[0]).toEqual('foo');

    let val = new ValueConstraint();
    val.value = 'bar';
    constraint.valueConstraints = [val];
    component.handleCategoricalAggregate(response);
    expect(component.selectedCategories[0]).toEqual('bar');
  })

  it('should handle date aggregate response', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    constraint.valDateConstraint = new TimeConstraint();
    constraint.valDateConstraint.dateOperator = DateOperatorState.NOT_BETWEEN;
    let response = new NumericalAggregate();
    response.min = 20000;
    response.max = 60000;
    component.handleDateAggregate(response);
    expect(component.valDate1.getTime()).toEqual(20000);
    expect(component.valDate2.getTime()).toEqual(60000);
    expect(component.valDateOperatorState).toEqual(DateOperatorState.NOT_BETWEEN);

    constraint.valDateConstraint.date1 = new Date(1434672000000);
    constraint.valDateConstraint.date2 = new Date(1529592161623);
    component.handleDateAggregate(response);
    expect(component.valDate1.getTime()).toEqual(1434664800000);
    expect(component.valDate2.getTime()).toEqual(1529584961623);
  })

  it('should update concept values', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;

    constraint.concept.type = null;
    component.updateConceptValues();

    let spy1 = spyOn(component, 'updateNumericConceptValues').and.stub();
    constraint.concept.type = ConceptType.NUMERICAL;
    component.updateConceptValues();
    expect(spy1).toHaveBeenCalledTimes(1);

    let spy2 = spyOn(component, 'updateCategoricalConceptValues').and.stub();
    constraint.concept.type = ConceptType.CATEGORICAL;
    component.updateConceptValues();
    expect(spy2).toHaveBeenCalledTimes(1);

    let spy3 = spyOn(component, 'updateDateConceptValues').and.stub();
    constraint.concept.type = ConceptType.DATE;
    component.updateConceptValues();
    expect(spy3).toHaveBeenCalledTimes(1);
  })

  it('should set selected concept', () => {
    let oldConcept = new Concept();
    let newConcept = new Concept();
    let spy1 = spyOn(component, 'initializeConstraints').and.stub();
    let spy2 = spyOn(component, 'update').and.stub();
    let constraint = new ConceptConstraint();
    constraint.concept = oldConcept;
    component.constraint = constraint;
    component.selectedConcept = newConcept;
    expect((<ConceptConstraint>component.constraint).concept).toBe(newConcept);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })

  it('should set observation dates', () => {
    let dummy = new Date();
    component.obsDate1 = dummy;
    expect(component.obsDate1).toBe(dummy);
    let invalidDummy = null;
    component.obsDate1 = invalidDummy;
    expect(component.obsDate1).toBe(dummy);
    invalidDummy = undefined;
    component.obsDate1 = invalidDummy;
    expect(component.obsDate1).toBe(dummy);

    component.obsDate2 = dummy;
    expect(component.obsDate2).toBe(dummy);
    invalidDummy = null;
    component.obsDate2 = invalidDummy;
    expect(component.obsDate2).toBe(dummy);
    invalidDummy = undefined;
    component.obsDate2 = invalidDummy;
    expect(component.obsDate2).toBe(dummy);
  })

  it('should search and find intended concepts', () => {
    let c = new Concept();
    c.path = 'test path';
    let c1 = new Concept();
    c1.path = 'other path';
    let dummies = [c, c1];
    let e = {
      query: 'some query'
    };
    constraintService.concepts = dummies;
    component.onSearch(e);
    expect(component.searchResults.length).toEqual(0);
    e.query = 'tESt';
    component.onSearch(e);
    expect(component.searchResults[0]).toEqual(c);
    e.query = '';
    component.onSearch(e);
    expect(component.searchResults.length).toEqual(2);
  })

  it('should handle drop down', () => {
    let c = new Concept();
    constraintService.concepts = [c];
    let e = new Event('');
    e['originalEvent'] = {
      stopPropagation: function () {
      },
      preventDefault: function () {
      }
    };
    let spy = spyOn(UIHelper, 'removePrimeNgLoaderIcon').and.stub();
    component.onDropdown(e);
    expect(component.searchResults.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  })

  it('should update numeric concept values', () => {

  })

});
