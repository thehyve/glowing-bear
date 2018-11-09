import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbFractalisControlComponent} from './gb-fractalis-control.component';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {DragDropModule, SelectButtonModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';

describe('GbFractalisControlComponent', () => {
  let component: GbFractalisControlComponent;
  let fixture: ComponentFixture<GbFractalisControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisControlComponent],
      imports: [
        FormsModule,
        SelectButtonModule,
        DragDropModule
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
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
    fixture = TestBed.createComponent(GbFractalisControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
