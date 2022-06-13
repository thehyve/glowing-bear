import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GbVariablesTreeComponent } from './gb-variables-tree.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CheckboxModule, DragDropModule} from 'primeng';
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
import {GbTreeSearchComponent} from '../../gb-tree-search/gb-tree-search.component';
import {MatExpansionModule} from '@angular/material/expansion';

describe('GbVariablesTreeComponent', () => {
  let component: GbVariablesTreeComponent;
  let fixture: ComponentFixture<GbVariablesTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesTreeComponent, GbTreeSearchComponent
      ],
      imports: [
        FormsModule,
        DragDropModule,
        MatExpansionModule,
        CheckboxModule,
        TreeModule,
        GbGenericModule,
        AutoCompleteModule,
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
