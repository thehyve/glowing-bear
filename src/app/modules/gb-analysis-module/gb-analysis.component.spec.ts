import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbAnalysisComponent } from './gb-analysis.component';

describe('GbAnalysisComponent', () => {
  let component: GbAnalysisComponent;
  let fixture: ComponentFixture<GbAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbAnalysisComponent', () => {
    expect(component).toBeTruthy();
  });
});
