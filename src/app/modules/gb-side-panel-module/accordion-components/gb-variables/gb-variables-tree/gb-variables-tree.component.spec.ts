import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbVariablesTreeComponent } from './gb-variables-tree.component';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {TreeNodeServiceMock} from '../../../../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../../../../services/tree-node.service';

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
        CheckboxModule
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
