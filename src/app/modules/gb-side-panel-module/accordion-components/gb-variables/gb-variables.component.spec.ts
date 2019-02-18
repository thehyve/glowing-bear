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
import {CategorizedVariable} from '../../../../models/constraint-models/categorized-variable';
import {Concept} from '../../../../models/constraint-models/concept';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {VariableService} from '../../../../services/variable.service';
import {VariableServiceMock} from '../../../../services/mocks/variable.service.mock';

describe('GbVariablesComponent', () => {
  let component: GbVariablesComponent;
  let fixture: ComponentFixture<GbVariablesComponent>;
  let constraintService: ConstraintService;
  let variableService: VariableService;
  let treeNodeService: TreeNodeService;

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
          provide: VariableService,
          useClass: VariableServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
    constraintService = TestBed.get(ConstraintService);
    treeNodeService = TestBed.get(TreeNodeService);
    variableService = TestBed.get(VariableService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should give correct number of checked variables', () => {
    let categorizedVars: Array<CategorizedVariable> = [];
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c1.selected = false;
    let c3 = new Concept();
    c1.selected = true;
    let spy1 = spyOnProperty(variableService, 'variables', 'get')
      .and.returnValue([c1, c2, c3]);
    expect(component.checkAllText.includes('2'));
  });

  it('should check all the variables', () => {
    let categorizedVars: Array<CategorizedVariable> = [];
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c2.selected = false;
    let c3 = new Concept();
    c3.selected = true;
    let spy1 = spyOnProperty(variableService, 'variables', 'get')
      .and.returnValue([c1, c2, c3]);
    component.checkAllVariables(true);
    expect(component.checkAllText.includes('3'));
    component.checkAllVariables(false);
    expect(component.checkAllText.includes('0'));
  });

  it('should call importCriteria when importing variables', () => {
    const spyImport = spyOn(FileImportHelper, 'importCriteria').and.stub();
    component.importVariables();
    expect(spyImport).toHaveBeenCalled();
    expect(component.isUploadListenerNotAdded).toBe(false);
  });

  it('should handle non-json file import', () => {
    const e = new Event('');
    const spyE = spyOnProperty(e, 'target', 'get').and.returnValue({result: []});
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    const fileXML = new File([], 'test.xml', {type: 'application/xml'});
    const spyGetFile = spyOn(FileImportHelper, 'getFile').and.returnValue(fileXML);
    component.handleVariablesFileUploadEvent(e);
    expect(spyE).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledWith('error', 'Invalid file format for variables import.');
    expect(spyGetFile).toHaveBeenCalled();
  });

  it('should handle importing invalid json', () => {
    const e = new Event('');
    const result = '{ "foo": "bar"}';
    const spyE = spyOnProperty(e, 'target', 'get').and.returnValue({result: result});
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    const file = new File([], 'test.json', {type: 'application/json'});
    const spyGetFile = spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    component.handleVariablesFileUploadEvent(e);
    expect(spyE).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledWith('error', 'Invalid file content for variables import.');
    expect(spyGetFile).toHaveBeenCalled();
  });

  it('should handle importing variables by names', () => {
    const result = '{"names": ["test-name-1", "test-name-3"]}';
    const e = new Event('');
    spyOnProperty(e, 'target', 'get').and.returnValue({result: result});
    const file = new File([], 'test.json', {type: 'application/json'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const spyCall = spyOn(variableService, 'importVariablesByNames').and.stub();
    component.handleVariablesFileUploadEvent(e);
    expect(spyCall).toHaveBeenCalled();
  });

  it('should handle importing variables by paths', () => {
    const result = '{"paths": ["foobar"]}';
    const e = new Event('');
    spyOnProperty(e, 'target', 'get').and.returnValue({result: result});
    const file = new File([], 'test.json', {type: 'application/json'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const spyCall = spyOn(variableService, 'importVariablesByPaths').and.stub();
    component.handleVariablesFileUploadEvent(e);
    expect(spyCall).toHaveBeenCalled();
  });

});
