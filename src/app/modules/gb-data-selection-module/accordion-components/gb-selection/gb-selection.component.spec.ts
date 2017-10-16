import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSelectionComponent} from './gb-selection.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule, MessagesModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GenericComponentMock} from '../../../../services/mocks/generic.component.mock';

describe('GbSelectionComponent', () => {
  let component: GbSelectionComponent;
  let fixture: ComponentFixture<GbSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSelectionComponent,
        GenericComponentMock({selector: 'gb-constraint', inputs: ['constraint', 'isRoot']})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        MessagesModule
      ],
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
