import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDroppableZoneComponent} from './gb-droppable-zone.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../services/cross-table.service';
import {CrossTableServiceMock} from '../../../services/mocks/cross-table.service.mock';

describe('GbDroppableZoneComponent', () => {
  let component: GbDroppableZoneComponent;
  let fixture: ComponentFixture<GbDroppableZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDroppableZoneComponent,
        MockComponent({selector: 'gb-draggable-cell', inputs: ['constraint']})
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
    fixture = TestBed.createComponent(GbDroppableZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
