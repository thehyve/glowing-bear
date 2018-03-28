import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableComponent} from './gb-table.component';
import {MockComponent} from 'ng2-mock-component';
import {CheckboxModule} from 'primeng/primeng';

describe('GbTableComponent', () => {
  let component: GbTableComponent;
  let fixture: ComponentFixture<GbTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbTableComponent,
        MockComponent({selector: 'gb-table-dimensions'}),
        MockComponent({selector: 'gb-table-grid'})
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
