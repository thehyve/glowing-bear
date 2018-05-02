import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbDroppableZoneComponent } from './gb-droppable-zone.component';

describe('GbDroppableZoneComponent', () => {
  let component: GbDroppableZoneComponent;
  let fixture: ComponentFixture<GbDroppableZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GbDroppableZoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDroppableZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
