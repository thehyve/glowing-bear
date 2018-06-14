import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCrossTableComponent} from './gb-cross-table.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../services/cross-table.service';
import {TableModule} from 'primeng/table';
import {ResourceService} from '../../../services/resource.service';
import {ResourceServiceMock} from '../../../services/mocks/resource.service.mock';

describe('GbCrossTableComponent', () => {
  let component: GbCrossTableComponent;
  let fixture: ComponentFixture<GbCrossTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCrossTableComponent,
        MockComponent({selector: 'gb-droppable-zone', inputs: ['constraints']})
      ],
      imports: [
        TableModule
      ],
      providers: [
        {
          provide: CrossTableService,
          useClass: CrossTableService
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCrossTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
