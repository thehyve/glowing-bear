import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbQueriesComponent} from './gb-queries.component';
import {
  AutoCompleteModule,
  ButtonModule,
  ConfirmationService,
  ConfirmDialogModule,
  DataListModule,
  DragDropModule,
  InputTextModule,
  PanelModule,
  RadioButtonModule,
  TooltipModule
} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {FormsModule} from '@angular/forms';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {Md2AccordionModule} from 'md2';

describe('QueriesComponent', () => {
  let component: GbQueriesComponent;
  let fixture: ComponentFixture<GbQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbQueriesComponent],
      imports: [
        BrowserAnimationsModule,
        DataListModule,
        DragDropModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        FormsModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        Md2AccordionModule,
        RadioButtonModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        ConfirmationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
