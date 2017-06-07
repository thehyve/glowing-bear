import {Component, OnInit, ElementRef} from '@angular/core';
import {DimensionRegistryService} from "../shared/services/dimension-registry.service";
import {SavedSet} from "../shared/models/saved-set";
import {ConstraintService} from "../shared/services/constraint.service";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {

  autoCompleteHolders: object[];

  searchResults: any;
  exportTaskName: string;

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    this.autoCompleteHolders = [{
      selectedSet: null
    }];
  }

  ngOnInit() {
  }

  onSearch(event) {
    console.log('on search: ', event);
    let query = event.query.toLowerCase();
    let patientSets = this.dimensionRegistry.getPatientSets();
    let observationSets = this.dimensionRegistry.getObservationSets();
    let sets = patientSets.concat(observationSets);

    if (query) {
      this.searchResults = sets.filter((set: SavedSet) => set.name.toLowerCase().includes(query));
    }
    else {
      this.searchResults = sets;
    }
  }

  onDropdown(event) {
    console.log('on dropdown: ', event);

    let patientSets = this.dimensionRegistry.getPatientSets();
    let observationSets = this.dimensionRegistry.getObservationSets();

    this.searchResults = [];
    this.searchResults = patientSets.concat(observationSets);
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
  }

  addAutoComplete() {
    this.autoCompleteHolders.push({
      selectedSet: null
    });
  }

  removeAutoComplete(index) {
    console.log('remove index: ', index);
    if(this.autoCompleteHolders.length > 1) {
      this.autoCompleteHolders.splice(index, 1);
    }
  }

  exportSelectedSets() {
    console.log(this.autoCompleteHolders);
  }

  onExportTaskNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  onExportAutoCompleteFormDrop(event, index) {
    console.log('event: ', event, index);
    event.stopPropagation();
    event.preventDefault();
    // this.constraintService.selectedPatientSet
    this.autoCompleteHolders[index]['selectedSet'] = this.constraintService.selectedSet;
  }
}
