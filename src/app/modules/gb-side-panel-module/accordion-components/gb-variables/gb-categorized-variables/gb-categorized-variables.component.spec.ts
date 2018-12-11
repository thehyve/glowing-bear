import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbCategorizedVariablesComponent } from './gb-categorized-variables.component';
import {CategorizedVariable} from '../../../../../models/constraint-models/categorized-variable';
import {Concept} from '../../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../../models/constraint-models/concept-type';

describe('GbCategorizedVariablesComponent', () => {
  let component: GbCategorizedVariablesComponent;
  let fixture: ComponentFixture<GbCategorizedVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCategorizedVariablesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCategorizedVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should give correct number of checked variables', () => {
    let categorizedVars: Array<CategorizedVariable> = [];
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c1.selected = false;
    let c3 = new Concept();
    c1.selected = true;
    const catVar1: CategorizedVariable = { type: ConceptType.CATEGORICAL, elements: [c1, c2] };
    const catVar2: CategorizedVariable = { type: ConceptType.CATEGORICAL, elements: [c3] };
    categorizedVars.push(catVar1);
    categorizedVars.push(catVar2);
    let spy1 = spyOnProperty(component, 'categorizedVariables', 'get')
      .and.returnValue(categorizedVars);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('2'));
  });

  it('should check all the variables', () => {
    let categorizedVars: Array<CategorizedVariable> = [];
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c2.selected = false;
    let c3 = new Concept();
    c3.selected = true;
    const catVar1: CategorizedVariable = { type: ConceptType.CATEGORICAL, elements: [c1, c2] };
    const catVar2: CategorizedVariable = { type: ConceptType.CATEGORICAL, elements: [c3] };
    categorizedVars.push(catVar1);
    categorizedVars.push(catVar2);
    let spy1 = spyOnProperty(component, 'categorizedVariables', 'get')
      .and.returnValue(categorizedVars);
    component.checkAll(true);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('3'));
    component.checkAll(false);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('0'));
  });
});
