/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConceptConstraintComponent} from './gb-concept-constraint.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule, MultiSelectModule, PanelModule, ListboxModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CohortService} from '../../../../services/cohort.service';
import {CohortServiceMock} from '../../../../services/mocks/cohort.service.mock';
import {Concept} from '../../../../models/constraint-models/concept';
import {of as observableOf} from 'rxjs';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {ErrorHelper} from '../../../../utilities/error-helper';
import {NumericalAggregate} from '../../../../models/aggregate-models/numerical-aggregate';
import {ValueConstraint} from '../../../../models/constraint-models/value-constraint';
import {GbConceptOperatorState} from './gb-concept-operator-state';
import {CategoricalAggregate} from '../../../../models/aggregate-models/categorical-aggregate';
import {TimeConstraint} from '../../../../models/constraint-models/time-constraint';
import {DateOperatorState} from '../../../../models/constraint-models/date-operator-state';
import {UIHelper} from '../../../../utilities/ui-helper';
import {FormatHelper} from '../../../../utilities/format-helper';
import {StudyServiceMock} from '../../../../services/mocks/study.service.mock';
import {StudyService} from '../../../../services/study.service';
import {throwError} from 'rxjs/internal/observable/throwError';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';
import {AuthenticationServiceMock} from '../../../../services/mocks/authentication.service.mock';
import {Operator} from '../../../../models/constraint-models/operator';
import {MockComponent} from 'ng2-mock-component';

describe('GbConceptConstraintComponent', () => {
  let component: GbConceptConstraintComponent;
  let fixture: ComponentFixture<GbConceptConstraintComponent>;
  let resourceService: ResourceService;
  let constraintService: ConstraintService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConceptConstraintComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-study-constraint', inputs: ['constraint']})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        PanelModule,
        MultiSelectModule,
        ListboxModule,
      ],
      providers: [
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceMock
        },
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
          provide: CohortService,
          useClass: CohortServiceMock
        },
        {
          provide: StudyService,
          useClass: StudyServiceMock
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
    let spy1 = spyOn(resourceService, 'getAggregate').and.returnValue(observableOf(dummyAggregate));
    let spy2 = spyOn(resourceService, 'getTrialVisits').and.returnValue(observableOf(dummyTrialVistis));
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
  });


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
  });

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
  });

  it('should not initialize the constraint when it is not numerical, categorical or date', () => {
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
  });

  it('should handle resource service errors during initialization', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    let spy = spyOn(ErrorHelper, 'handleError').and.stub();
    spyOn(resourceService, 'getAggregate').and.callFake(() => {
      return throwError('error');
    });
    spyOn(resourceService, 'getTrialVisits').and.callFake(() => {
      return throwError('error');
    });
    component.initializeConstraints();
    expect(spy).toHaveBeenCalledTimes(2);
  });

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
    val1.operator = <Operator>'>';
    val1.value = 11;
    let val2 = new ValueConstraint();
    val2.operator = <Operator>'<';
    val2.value = 100;
    let val3 = new ValueConstraint();
    val3.operator = <Operator>'=';
    val3.value = 15;
    let val4 = new ValueConstraint();
    val4.operator = <Operator>'other';
    val4.value = 16;
    constraint.valueConstraints = [
      val1, val2, val3, val4
    ];
    component.handleNumericAggregate(response);
    expect(component.minVal).toEqual(11);
    expect(component.maxVal).toEqual(100);
    expect(component.equalVal).toEqual(15);
    expect(component.operatorState).toEqual(GbConceptOperatorState.EQUAL);
  });

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
  });

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
  });

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
  });

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
  });

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
  });

  it('should search and find intended concepts', () => {
    let c = new Concept();
    c.fullName = ' This is a tESt  ';
    let c1 = new Concept();
    let dummies = [c, c1];
    let e = {
      query: 'some query'
    };
    constraintService.concepts = dummies;
    component.onSearch(e);
    expect(component.searchResults.length).toEqual(0);
    e.query = 'tESt';
    component.onSearch(e);
    expect(component.searchResults.length).toEqual(1);
    expect(component.searchResults[0]).toEqual(c);
    e.query = '';
    component.onSearch(e);
    expect(component.searchResults.length).toEqual(2);
  });

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
  });

  it('should update numeric concept values', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    constraint.valueConstraints = null;
    component.constraint = constraint;

    component.operatorState = null;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints).toBe(null);

    component.operatorState = GbConceptOperatorState.EQUAL;
    component.equalVal = null;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints).toBe(null);

    component.operatorState = GbConceptOperatorState.EQUAL;
    component.equalVal = 100;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints.length).toEqual(1);
    expect(constraint.valueConstraints[0].value).toEqual(100);

    component.operatorState = GbConceptOperatorState.BETWEEN;
    component.minVal = null;
    component.maxVal = null;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints.length).toEqual(0);

    component.operatorState = GbConceptOperatorState.BETWEEN;
    component.minVal = 200;
    component.isMinEqual = false;
    component.maxVal = null;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints.length).toEqual(1);
    expect(constraint.valueConstraints[0].value).toEqual(200);
    expect(constraint.valueConstraints[0].operator).toEqual('>');

    component.minVal = null;
    component.maxVal = 300;
    component.isMaxEqual = false;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints.length).toEqual(1);
    expect(constraint.valueConstraints[0].value).toEqual(300);
    expect(constraint.valueConstraints[0].operator).toEqual('<');

    component.minVal = 200;
    component.isMinEqual = true;
    component.maxVal = 300;
    component.isMaxEqual = true;
    component.updateNumericConceptValues();
    expect(constraint.valueConstraints.length).toEqual(2);
    expect(constraint.valueConstraints[0].operator).toEqual('>=');
    expect(constraint.valueConstraints[1].operator).toEqual('<=');
  });

  it('should update categorical concept values', () => {
    component.selectedCategories = ['a', 'b', FormatHelper.nullValuePlaceholder];
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    component.updateCategoricalConceptValues();
    expect(constraint.valueConstraints.length).toBe(3);
  });

  it('should update date concept values', () => {
    let constraint = new ConceptConstraint();
    constraint.concept = new Concept();
    component.constraint = constraint;
    component.updateDateConceptValues();
    expect(constraint.applyValDateConstraint).toBe(true);

    component.valDate1 = new Date('2016-06-06');
    component.updateDateConceptValues();
    expect(constraint.valDateConstraint.date1.getTime()).toEqual(1465178400000);

    component.valDate2 = new Date('2018-06-06');
    component.updateDateConceptValues();
    expect(constraint.valDateConstraint.date2.getTime()).toEqual(1528250400000);
  });

  it('should check the states of the concept component', () => {
    let c: Concept = new Concept();
    (<ConceptConstraint>component.constraint).concept = c;
    c.type = ConceptType.NUMERICAL;
    expect(component.isNumeric()).toBe(true);
    expect(component.isCategorical()).toBe(false);
    expect(component.isDate()).toBe(false);
    c.type = ConceptType.CATEGORICAL;
    expect(component.isNumeric()).toBe(false);
    expect(component.isCategorical()).toBe(true);
    expect(component.isDate()).toBe(false);
    c.type = ConceptType.DATE;
    expect(component.isNumeric()).toBe(false);
    expect(component.isCategorical()).toBe(false);
    expect(component.isDate()).toBe(true);
  });

  it('should return false when concept is absent in constraint', () => {
    (<ConceptConstraint>component.constraint).concept = null;
    expect(component.isNumeric()).toBe(false);
    expect(component.isCategorical()).toBe(false);
    expect(component.isDate()).toBe(false);
  });

  it('should sort the suggested categorical values first on selection, then on alphabet', () => {
    component.selectedCategories = ['mouth', 'stomach', 'leg'];
    component.suggestedCategories = [];
    let suggestedCategoryValues = ['lung', 'mouth', 'head', 'stomach', 'breast', 'leg'];
    suggestedCategoryValues.forEach(name => {
      component.suggestedCategories.push({
        label: name, value: name
      });
    });
    component.onCategoricalValuePanelHide();
    expect(component.suggestedCategories[0].value).toEqual('leg');
    expect(component.suggestedCategories[1].value).toEqual('mouth');
    expect(component.suggestedCategories[2].value).toEqual('stomach');
    expect(component.suggestedCategories[3].value).toEqual('breast');
  });

});
