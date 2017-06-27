import {Component, OnInit, ElementRef} from '@angular/core';
import {DimensionRegistryService} from "../shared/services/dimension-registry.service";
import {SavedSet} from "../shared/models/saved-set";
import {ConstraintService} from "../shared/services/constraint.service";
import {DropMode} from "../shared/models/drop-mode";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {

  autoCompleteHolders: object[];
  selectedSets: SavedSet[];

  searchResults: any;
  exportTaskName: string;


  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    this.autoCompleteHolders = [{
      selectedSet: null
    }];
    this.selectedSets = [];
  }

  ngOnInit() {
  }

  onSearch(event) {
    console.log('event: ', event, ', query: ', event.query);
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
    let patientSets = this.dimensionRegistry.getPatientSets();
    let observationSets = this.dimensionRegistry.getObservationSets();

    this.searchResults = [];
    this.searchResults = patientSets.concat(observationSets);
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
  }

  exportSelectedSets() {
    console.log('Export these sets: ', this.selectedSets);
  }

  onExportTaskNameInputDrop(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  onExportAutoCompleteFormDrop(event) {
    event.stopPropagation();
    event.preventDefault();

    let selectedNode = this.constraintService.selectedNode;
    let dropMode = selectedNode.dropMode;
    if ((dropMode === DropMode.PatientSet || dropMode === DropMode.ObservationSet)
      && (this.selectedSets.indexOf(selectedNode) === -1)) {
      this.selectedSets.push(selectedNode);
    }
  }

}
