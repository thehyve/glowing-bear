import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPatientSetsComponent } from './saved-patient-sets.component';

describe('SavedPatientSetsComponent', () => {
  let component: SavedPatientSetsComponent;
  let fixture: ComponentFixture<SavedPatientSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavedPatientSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedPatientSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
