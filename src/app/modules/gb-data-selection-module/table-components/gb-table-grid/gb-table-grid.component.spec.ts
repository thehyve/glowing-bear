import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTableTableComponent} from './gb-table-grid.component';
import {TableService} from '../../../../services/table.service';
import {TableServiceMock} from '../../../../services/mocks/table.service.mock';
import {TableModule} from 'primeng/table';

describe('GbTableTableComponent', () => {
  let component: GbTableTableComponent;
  let fixture: ComponentFixture<GbTableTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTableTableComponent],
      imports: [
        TableModule
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
    fixture = TestBed.createComponent(GbTableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('GbTableTableComponent should be created.', () => {
    expect(component).toBeTruthy();
  });
});
