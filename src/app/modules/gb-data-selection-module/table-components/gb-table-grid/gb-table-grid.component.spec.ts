import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableGridComponent} from './gb-table-grid.component';
import {TableService} from '../../../../services/table.service';
import {TableServiceMock} from '../../../../services/mocks/table.service.mock';
import {TableModule} from 'primeng/table';
import {TooltipModule} from "primeng/primeng";

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
          provide: TableService,
          useClass: TableServiceMock
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

  it('GbTableGridComponent should be created.', () => {
    expect(component).toBeTruthy();
  });
});
