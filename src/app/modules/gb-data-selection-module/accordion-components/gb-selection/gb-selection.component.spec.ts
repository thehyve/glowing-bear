import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSelectionComponent} from './gb-selection.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule, MessagesModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {MessageServiceMock} from '../../../../services/mocks/message.service.mock';
import {MessageService} from '../../../../services/message.service';

describe('GbSelectionComponent', () => {
  let component: GbSelectionComponent;
  let fixture: ComponentFixture<GbSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSelectionComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint', 'isRoot']})
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
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
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

  it('GbSelectionComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
