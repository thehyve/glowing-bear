import {Component, OnInit} from '@angular/core';
import {FileImportHelper} from '../../../../utilities/file-import-helper';
import {MessageHelper} from '../../../../utilities/message-helper';
import {VariablesViewMode} from '../../../../models/variables-view-mode';
import {SelectItem} from 'primeng/api';
import {NavbarService} from '../../../../services/navbar.service';
import {VariableService} from '../../../../services/variable.service';

@Component({
  selector: 'gb-variables',
  templateUrl: './gb-variables.component.html',
  styleUrls: ['./gb-variables.component.css']
})
export class GbVariablesComponent implements OnInit {

  public allChecked: boolean;

  public VariablesViewMode = VariablesViewMode; // make enum visible in template
  public readonly fileElementId: string = 'variablesCriteriaFileUpload';

  public isUploadListenerNotAdded: boolean;
  public file: File; // holds the uploaded cohort file

  private _availableViewModes: SelectItem[];

  constructor(private variableService: VariableService,
              private navbarService: NavbarService) {
    this.allChecked = true;
    this.isUploadListenerNotAdded = true;
    this.viewMode = VariablesViewMode.TREE_VIEW;
    this.availableViewModes = this.listAvailableViewModes();
  }

  ngOnInit() {
    this.checkAllVariables(true);
  }

  importVariables() {
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
      let _json = JSON.parse(data);
      if (_json['names']) {
        this.variableService.importVariablesByNames(_json['names']);
      } else if (_json['paths']) {
        this.variableService.importVariablesByPaths(_json['paths']);
      } else {
        MessageHelper.alert('error', 'Invalid file content for variables import.');
        return;
      }
    } else {
      MessageHelper.alert('error', 'Invalid file format for variables import.');
      return;
    }
  }

  private listAvailableViewModes(): SelectItem[] {
    return Object.keys(VariablesViewMode).map(c => {
      return {
        label: VariablesViewMode[c],
        value: VariablesViewMode[c]}
    }) as SelectItem[];
  }

  get viewMode(): VariablesViewMode {
    return this.variableService.variablesViewMode;
  }

  set viewMode(value: VariablesViewMode) {
    this.variableService.variablesViewMode = value;
  }

  get availableViewModes(): SelectItem[] {
    return this._availableViewModes;
  }

  set availableViewModes(value: SelectItem[]) {
    this._availableViewModes = value;
  }

  get isExport(): boolean {
    return this.navbarService.isExport;
  }

  checkAllVariables(b: boolean) {
    this.variableService.setVariableSelection(b);
  }

  get checkAllText(): string {
    let numSelected = this.numberOfSelected;
    return numSelected === 1 ?
      `${numSelected} variable selected` : `${numSelected} variables selected`;
  }

  get numberOfSelected(): number {
    return this.variableService.variables.filter(v =>
      v.selected === true).length;
  }

}
