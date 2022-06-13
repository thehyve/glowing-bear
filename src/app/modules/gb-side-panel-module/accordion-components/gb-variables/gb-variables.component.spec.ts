/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbVariablesComponent} from './gb-variables.component';
import {AutoCompleteModule, CheckboxModule, DragDropModule, SelectButtonModule} from 'primeng';
import {FormsModule} from '@angular/forms';
import {MockComponent} from 'ng2-mock-component';
import {NavbarService} from '../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../services/mocks/navbar.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {Concept} from '../../../../models/constraint-models/concept';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {VariableService} from '../../../../services/variable.service';
import {VariableServiceMock} from '../../../../services/mocks/variable.service.mock';
import {GbTreeSearchComponent} from '../gb-tree-search/gb-tree-search.component';
import {GbTreeNode} from '../../../../models/tree-node-models/gb-tree-node';
import {MatExpansionModule} from '@angular/material/expansion';

describe('GbVariablesComponent', () => {
  let component: GbVariablesComponent;
  let fixture: ComponentFixture<GbVariablesComponent>;
  let constraintService: ConstraintService;
  let variableService: VariableService;
  let treeNodeService: TreeNodeService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbVariablesComponent,
        MockComponent({selector: 'gb-variables-tree'}),
        MockComponent({selector: 'gb-categorized-variables'}),
        GbTreeSearchComponent
      ],
      imports: [
        FormsModule,
        DragDropModule,
        MatExpansionModule,
        CheckboxModule,
        SelectButtonModule,
        AutoCompleteModule,
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
    constraintService = TestBed.inject(ConstraintService);
    treeNodeService = TestBed.inject(TreeNodeService);
    variableService = TestBed.inject(VariableService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should give correct number of checked variables', () => {
    let categorizedVars: Array<GbTreeNode> = [];
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
    let categorizedVars: Array<GbTreeNode> = [];
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c2.selected = false;
    let c3 = new Concept();
    c3.selected = true;
    let spy1 = spyOnProperty(variableService, 'variables', 'get')
      .and.returnValue([c1, c2, c3]);
    component.allChecked = true;
    expect(component.checkAllText.includes('3'));
    component.allChecked = false;
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
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    spyOnProperty(e, 'target', 'get').and.returnValue({result: result});
    const file = new File([], 'test.json', {type: 'application/json'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const spyCall = spyOn(variableService, 'importVariablesByNames').and.stub();
    component.handleVariablesFileUploadEvent(e);
    expect(spyCall).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledWith('info', 'Variables file upload successful!');
  });

  it('should handle importing variables by paths', () => {
    const result = '{"paths": ["foobar"]}';
    const e = new Event('');
    const spyMessage = spyOn(MessageHelper, 'alert').and.stub();
    spyOnProperty(e, 'target', 'get').and.returnValue({result: result});
    const file = new File([], 'test.json', {type: 'application/json'});
    spyOn(FileImportHelper, 'getFile').and.returnValue(file);
    const spyCall = spyOn(variableService, 'importVariablesByPaths').and.stub();
    component.handleVariablesFileUploadEvent(e);
    expect(spyCall).toHaveBeenCalled();
    expect(spyMessage).toHaveBeenCalledWith('info', 'Variables file upload successful!');
  });

  it('should enable check mark only when all variables are selected', () => {
    let c1 = new Concept();
    c1.selected = true;
    let c2 = new Concept();
    c2.selected = true;
    let dummies = [c1, c2];
    spyOnProperty(variableService, 'variables', 'get').and.returnValue(dummies);
    expect(component.allChecked).toBe(true);
    c2.selected = false;
    expect(component.allChecked).toBe(false);
  });

});
