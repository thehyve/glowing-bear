import {Component, OnInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {Concept} from '../../../../models/constraint-models/concept';
import {CategorizedVariable} from '../../../../models/constraint-models/categorized-variable';
import {NavbarService} from '../../../../services/navbar.service';
import {DataTableService} from '../../../../services/data-table.service';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {MessageHelper} from '../../../../utilities/message-helper';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {

  public readonly fileElementId: string = 'variablesCriteriaFileUpload';

  private _categorizedVariables: Array<CategorizedVariable> = [];

  public allChecked: boolean;
  public checkAllText: string;
  private isUploadListenerNotAdded: boolean;
  file: File; // holds the uploaded cohort file

  constructor(private constraintService: ConstraintService,
              private dataTableService: DataTableService,
              private navbarService: NavbarService,
              private treeNodeService: TreeNodeService) {
    this.constraintService.variablesUpdated.asObservable()
      .subscribe((variables: Concept[]) => {
        this.categorizeVariables(variables);
      });

    this.allChecked = true;
  }

  ngOnInit() {
  }

  private categorizeVariables(variables: Concept[]) {
    this.categorizedVariables.length = 0;
    variables.forEach((variable: Concept) => {
      let existingVariable = this.categorizedVariables.filter(x => x.type === variable.type)[0];
      if (existingVariable) {
        existingVariable.elements.push(variable);
      } else {
        this.categorizedVariables.push({type: variable.type, elements: [variable]});
      }
    });
    this.updateCheckAllText();
  }

  updateCheckAllText() {
    let numSelected = 0;
    this.categorizedVariables.forEach((catVar: CategorizedVariable) => {
      catVar.elements.forEach((c: Concept) => {
        if (c.selected) {
          numSelected++;
        }
      });
    });
    this.checkAllText = numSelected === 1 ?
      `${numSelected} variable selected` : `${numSelected} variables selected`;
  }

  checkVariables() {
    this.dataTableService.isDirty = true;
    this.updateCheckAllText();
  }

  checkAll(b: boolean) {
    this.categorizedVariables.forEach((catVar: CategorizedVariable) => {
      catVar.elements.forEach((c: Concept) => {
        c.selected = b;
      })
    });
    this.checkVariables();
  }

  onDragStart(e, concept) {
    this.constraintService.draggedVariable = concept;
  }

  importVariables() {
    MessageHelper.alert('info', 'File upload started. Processing...');
    let reader = new FileReader();
    reader.onload = this.handleVariablesFileUploadEvent.bind(this);
    FileImportHelper.importCriteria(this.fileElementId, reader, this.isUploadListenerNotAdded);
    this.isUploadListenerNotAdded = false;
  }

  handleVariablesFileUploadEvent(e) {
    let data = e.target['result'];
    this.file = FileImportHelper.getFile(this.fileElementId);
    // file.type is empty for some browsers and Windows OS
    if (FileImportHelper.isJsonFile(this.file)) {
      let observationQuery = {};
      let _json = JSON.parse(data);
      if (_json['names']) {
        let pathArray = [];
        this.treeNodeService.convertItemsToPaths(this.treeNodeService.treeNodes, _json['names'], pathArray);
        observationQuery = {
          data: pathArray
        };
      } else if (_json['paths']) {
        observationQuery = {
          data: _json['paths']
        };
      } else {
        MessageHelper.alert('error', 'Invalid file content for variables import.');
        return;
      }
      return {
        'name': this.file.name.substr(0, this.file.name.indexOf('.')),
        'observationsQuery': observationQuery
      };
    } else {
      MessageHelper.alert('error', 'Invalid file format for variables import.');
      return;
    }
    MessageHelper.alert('info', 'File upload finished successfully!');

  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  get variablesDragDropScope(): string {
    return this.constraintService.variablesDragDropScope;
  }

  get categorizedVariables(): Array<CategorizedVariable> {
    return this._categorizedVariables;
  }

  set categorizedVariables(value: Array<CategorizedVariable>) {
    this._categorizedVariables = value;
  }
}
