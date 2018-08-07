import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbFractalisComponent } from './gb-fractalis.component';

describe('GbFractalisComponent', () => {
  let component: GbFractalisComponent;
  let fixture: ComponentFixture<GbFractalisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbFractalisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbFractalisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
