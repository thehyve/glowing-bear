import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationSelectionComponent } from './observation-selection.component';

describe('ObservationSelectionComponent', () => {
  let component: ObservationSelectionComponent;
  let fixture: ComponentFixture<ObservationSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
