import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableDimensionsComponent} from './gb-table-dimensions.component';
import {TableService} from '../../../../services/table.service';
import {PickListModule} from 'primeng/primeng';

describe('GbTableDimensionsComponent', () => {
  let component: GbTableDimensionsComponent;
  let fixture: ComponentFixture<GbTableDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableDimensionsComponent],
      imports: [
        PickListModule
      ],
      providers: [TableService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbTableDimensionsComponent', () => {
    expect(component).toBeTruthy();
  });
});
