import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbLoadingComponent } from './gb-loading.component';

describe('GbLoadingComponent', () => {
  let component: GbLoadingComponent;
  let fixture: ComponentFixture<GbLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
