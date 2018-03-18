import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableComponent} from './gb-table.component';
import {MockComponent} from 'ng2-mock-component';

describe('GbTableComponent', () => {
  let component: GbTableComponent;
  let fixture: ComponentFixture<GbTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbTableComponent,
        MockComponent({selector: 'gb-table-dimensions'})
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbTableComponent', () => {
    expect(component).toBeTruthy();
  });
});
