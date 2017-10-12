import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableComponent} from './gb-table.component';
import {TreeTableModule} from 'primeng/primeng';

describe('GbTableComponent', () => {
  let component: GbTableComponent;
  let fixture: ComponentFixture<GbTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbTableComponent
      ],
      imports: [
        TreeTableModule
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
