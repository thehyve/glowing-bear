import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinationConstraintComponent } from './combination-constraint.component';

describe('CombinationConstraintComponent', () => {
  let component: CombinationConstraintComponent;
  let fixture: ComponentFixture<CombinationConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinationConstraintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinationConstraintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
