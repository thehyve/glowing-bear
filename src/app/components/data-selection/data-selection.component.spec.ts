import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSelectionComponent } from './data-selection.component';

describe('DataSelectionComponent', () => {
  let component: DataSelectionComponent;
  let fixture: ComponentFixture<DataSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
