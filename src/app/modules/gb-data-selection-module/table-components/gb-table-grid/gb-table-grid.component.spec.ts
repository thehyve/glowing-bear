import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableGridComponent} from './gb-table-grid.component';
import {DataTableService} from '../../../../services/data-table.service';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';
import {TableModule} from 'primeng/table';
import {TooltipModule} from 'primeng/primeng';

describe('GbTableGridComponent', () => {
  let component: GbTableGridComponent;
  let fixture: ComponentFixture<GbTableGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableGridComponent],
      imports: [
        TableModule,
        TooltipModule
      ],
      providers: [
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbTableGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created.', () => {
    expect(component).toBeTruthy();
  });
});
