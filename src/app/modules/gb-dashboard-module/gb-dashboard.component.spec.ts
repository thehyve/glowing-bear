import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbDashboardComponent } from './gb-dashboard.component';

describe('GbDashboardComponent', () => {
  let component: GbDashboardComponent;
  let fixture: ComponentFixture<GbDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('GbDashboardComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
