import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbDraggableCellComponent } from './gb-draggable-cell.component';

describe('GbDraggableCellComponent', () => {
  let component: GbDraggableCellComponent;
  let fixture: ComponentFixture<GbDraggableCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbDraggableCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDraggableCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
