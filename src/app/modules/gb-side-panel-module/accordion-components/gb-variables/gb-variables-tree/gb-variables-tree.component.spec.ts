import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbVariablesTreeComponent } from './gb-variables-tree.component';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {TreeNodeServiceMock} from '../../../../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../../../../services/tree-node.service';
import {NavbarService} from '../../../../../services/navbar.service';
import {DataTableService} from '../../../../../services/data-table.service';
import {DataTableServiceMock} from '../../../../../services/mocks/data-table.service.mock';
import {NavbarServiceMock} from '../../../../../services/mocks/navbar.service.mock';
import {ConstraintService} from '../../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../../services/mocks/constraint.service.mock';
import {TreeModule} from 'primeng/tree';
import {GbGenericModule} from '../../../../gb-generic-module/gb-generic.module';
import {VariableService} from '../../../../../services/variable.service';
import {VariableServiceMock} from '../../../../../services/mocks/variable.service.mock';

describe('GbVariablesTreeComponent', () => {
  let component: GbVariablesTreeComponent;
  let fixture: ComponentFixture<GbVariablesTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesTreeComponent
      ],
      imports: [
        FormsModule,
        DragDropModule,
        MatExpansionModule,
        CheckboxModule,
        TreeModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: VariableService,
          useClass: VariableServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbVariablesTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
