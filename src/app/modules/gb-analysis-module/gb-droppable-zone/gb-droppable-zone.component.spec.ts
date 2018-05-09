import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDroppableZoneComponent} from './gb-droppable-zone.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../services/cross-table.service';
import {CrossTableServiceMock} from '../../../services/mocks/cross-table.service.mock';
import {DragDropModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../services/mocks/tree-node.service.mock';
import {ConstraintService} from '../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../services/mocks/constraint.service.mock';

describe('GbDroppableZoneComponent', () => {
  let component: GbDroppableZoneComponent;
  let fixture: ComponentFixture<GbDroppableZoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDroppableZoneComponent,
        MockComponent({selector: 'gb-draggable-cell', inputs: ['constraint']})
      ],
      imports: [
        DragDropModule
      ],
      providers: [
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
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
