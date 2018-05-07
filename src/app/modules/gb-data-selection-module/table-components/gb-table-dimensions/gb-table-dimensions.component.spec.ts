import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableDimensionsComponent} from './gb-table-dimensions.component';
import {DataTableService} from '../../../../services/data-table.service';
import {CheckboxModule, PickListModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';

describe('GbTableDimensionsComponent', () => {
  let component: GbTableDimensionsComponent;
  let fixture: ComponentFixture<GbTableDimensionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableDimensionsComponent],
      imports: [
        PickListModule,
        CheckboxModule,
        FormsModule,
        BrowserModule
      ],
      providers: [
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableDimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
