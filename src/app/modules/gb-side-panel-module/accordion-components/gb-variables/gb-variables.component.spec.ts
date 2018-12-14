import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbVariablesComponent} from './gb-variables.component';
import {MatExpansionModule} from '@angular/material';
import {CheckboxModule, DragDropModule, SelectButtonModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {MockComponent} from 'ng2-mock-component';
import {NavbarService} from '../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../services/mocks/navbar.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';

describe('GbVariablesComponent', () => {
  let component: GbVariablesComponent;
  let fixture: ComponentFixture<GbVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesComponent,
        MockComponent({selector: 'gb-variables-tree'}),
        MockComponent({selector: 'gb-categorized-variables'})
      ],
      imports: [
        FormsModule,
        DragDropModule,
        MatExpansionModule,
        CheckboxModule,
        SelectButtonModule
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
