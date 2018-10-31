import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbVariablesComponent} from './gb-variables.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {MatExpansionModule} from '@angular/material';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {NavbarService} from '../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../services/mocks/navbar.service.mock';
import {FormsModule} from '@angular/forms';

describe('GbVariablesComponent', () => {
  let component: GbVariablesComponent;
  let fixture: ComponentFixture<GbVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesComponent
      ],
      imports: [
        FormsModule,
        DragDropModule,
        MatExpansionModule,
        CheckboxModule
      ],
      providers: [
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        }
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
