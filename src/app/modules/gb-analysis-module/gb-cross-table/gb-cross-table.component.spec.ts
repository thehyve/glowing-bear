import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbCrossTableComponent } from './gb-cross-table.component';

describe('GbCrossTableComponent', () => {
  let component: GbCrossTableComponent;
  let fixture: ComponentFixture<GbCrossTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbCrossTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCrossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
