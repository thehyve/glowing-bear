import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbVariablesComponent} from './gb-variables.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';

describe('GbVariablesComponent', () => {
  let component: GbVariablesComponent;
  let fixture: ComponentFixture<GbVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesComponent
      ],
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
