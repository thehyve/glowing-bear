import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbPedigreeConstraintComponent} from './gb-pedigree-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {DropdownModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {GenericComponentMock} from '../../../../services/mocks/generic.component.mock';
import {PedigreeConstraint} from '../../../../models/constraints/pedigree-constraint';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('GbPedigreeConstraintComponent', () => {
  let component: GbPedigreeConstraintComponent;
  let fixture: ComponentFixture<GbPedigreeConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbPedigreeConstraintComponent,
        GenericComponentMock({selector: 'gb-combination-constraint', inputs: ['constraint']}),
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        DropdownModule
      ],
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
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
    fixture = TestBed.createComponent(GbPedigreeConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new PedigreeConstraint('PAR');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
