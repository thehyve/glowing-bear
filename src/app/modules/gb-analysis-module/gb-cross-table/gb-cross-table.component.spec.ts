import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCrossTableComponent} from './gb-cross-table.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableServiceMock} from '../../../services/mocks/cross-table.service.mock';
import {CrossTableService} from '../../../services/cross-table.service';

describe('GbCrossTableComponent', () => {
  let component: GbCrossTableComponent;
  let fixture: ComponentFixture<GbCrossTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCrossTableComponent,
        MockComponent({selector: 'gb-droppable-zone', inputs: ['constraints']})
      ],
      providers: [
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
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
