import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedObservationSetsComponent } from './saved-observation-sets.component';

describe('SavedObservationSetsComponent', () => {
  let component: SavedObservationSetsComponent;
  let fixture: ComponentFixture<SavedObservationSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavedObservationSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedObservationSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SavedObservationSetsComponent', () => {
    expect(component).toBeTruthy();
  });
});
