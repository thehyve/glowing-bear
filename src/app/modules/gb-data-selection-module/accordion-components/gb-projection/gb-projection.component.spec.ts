import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbProjectionComponent} from './gb-projection.component';
import {TreeModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {QueryService} from '../../../../services/query.service';

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
          provide: QueryService,
          useClass: QueryServiceMock
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

  it('GbProjectionComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
