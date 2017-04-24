import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyConstraintComponent } from './study-constraint.component';

describe('StudyConstraintComponent', () => {
  let component: StudyConstraintComponent;
  let fixture: ComponentFixture<StudyConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyConstraintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
