import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ObservationSelectionComponent} from './observation-selection.component';
import {TreeModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';

describe('ObservationSelectionComponent', () => {
  let component: ObservationSelectionComponent;
  let fixture: ComponentFixture<ObservationSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObservationSelectionComponent],
      imports: [
        FormsModule,
        TreeModule
      ],
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
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
    fixture = TestBed.createComponent(ObservationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ObservationSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
