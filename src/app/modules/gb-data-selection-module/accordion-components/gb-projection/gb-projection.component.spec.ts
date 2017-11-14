import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbProjectionComponent} from './gb-projection.component';
import {TreeModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';

describe('GbProjectionComponent', () => {
  let component: GbProjectionComponent;
  let fixture: ComponentFixture<GbProjectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbProjectionComponent
      ],
      imports: [
        TreeModule
      ],
      providers: [
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
    fixture = TestBed.createComponent(GbProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbProjectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
