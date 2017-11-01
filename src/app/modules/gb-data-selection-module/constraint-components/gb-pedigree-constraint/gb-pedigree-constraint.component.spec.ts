import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbPedigreeConstraintComponent} from './gb-pedigree-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';

describe('GbPedigreeConstraintComponent', () => {
  let component: GbPedigreeConstraintComponent;
  let fixture: ComponentFixture<GbPedigreeConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbPedigreeConstraintComponent],
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
