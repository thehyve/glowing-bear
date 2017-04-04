import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSelectionComponent } from './patient-selection.component';

describe('PatientSelectionComponent', () => {
  let component: PatientSelectionComponent;
  let fixture: ComponentFixture<PatientSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
