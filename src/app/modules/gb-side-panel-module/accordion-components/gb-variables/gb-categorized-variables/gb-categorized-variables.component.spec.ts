import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {GbCategorizedVariablesComponent} from './gb-categorized-variables.component';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatExpansionModule} from '@angular/material';
import {NavbarService} from '../../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../../services/mocks/navbar.service.mock';
import {VariableService} from '../../../../../services/variable.service';
import {VariableServiceMock} from '../../../../../services/mocks/variable.service.mock';
import {TreeNodeService} from "../../../../../services/tree-node.service";
import {TreeNodeServiceMock} from "../../../../../services/mocks/tree-node.service.mock";

describe('GbCategorizedVariablesComponent', () => {
  let component: GbCategorizedVariablesComponent;
  let fixture: ComponentFixture<GbCategorizedVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCategorizedVariablesComponent
      ],
      imports: [
        FormsModule,
        CheckboxModule,
        MatButtonModule,
        MatExpansionModule,
        DragDropModule
      ],
      providers: [
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock,
        },
        {
          provide: VariableService,
          useClass: VariableServiceMock,
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCategorizedVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
