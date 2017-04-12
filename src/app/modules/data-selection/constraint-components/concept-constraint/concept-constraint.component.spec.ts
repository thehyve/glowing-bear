import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptConstraintComponent } from './concept-constraint.component';

describe('ConceptConstraintComponent', () => {
  let component: ConceptConstraintComponent;
  let fixture: ComponentFixture<ConceptConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConceptConstraintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConceptConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
