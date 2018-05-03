import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataTableComponent} from './gb-data-table.component';
import {MockComponent} from 'ng2-mock-component';

describe('GbDataTableComponent', () => {
  let component: GbDataTableComponent;
  let fixture: ComponentFixture<GbDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDataTableComponent,
        MockComponent({selector: 'gb-table-dimensions'}),
        MockComponent({selector: 'gb-table-grid'})
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
