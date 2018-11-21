import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbVariablesComponent} from './gb-variables.component';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {MatExpansionModule} from '@angular/material';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {NavbarService} from '../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../services/mocks/navbar.service.mock';
import {FormsModule} from '@angular/forms';
import {Concept} from '../../../../models/constraint-models/concept';
import {DataTableService} from '../../../../services/data-table.service';
import {DataTableServiceMock} from '../../../../services/mocks/data-table.service.mock';

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
          provide: DataTableService,
          useClass: DataTableServiceMock
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

  it('should give correct number of checked variables', () => {
    let categorizedVars = new Map<string, Array<Concept>>();
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c1.selected = false;
    let c3 = new Concept();
    c1.selected = true;
    categorizedVars.set('cat1', [c1, c2]);
    categorizedVars.set('cat2', [c3]);
    let spy1 = spyOnProperty(component, 'categorizedVariables', 'get')
      .and.returnValue(categorizedVars);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('2'));
  });

  it('should check all the variables', () => {
    let categorizedVars = new Map<string, Array<Concept>>();
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c2.selected = false;
    let c3 = new Concept();
    c3.selected = true;
    categorizedVars.set('cat1', [c1, c2]);
    categorizedVars.set('cat2', [c3]);
    let spy1 = spyOnProperty(component, 'categorizedVariables', 'get')
      .and.returnValue(categorizedVars);
    component.checkAll(true);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('3'));
    component.checkAll(false);
    component.updateCheckAllText();
    expect(component.checkAllText.includes('0'));
  });
});
