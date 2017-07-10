import {Component, OnInit, ElementRef} from '@angular/core';
import {DimensionRegistryService} from "../shared/services/dimension-registry.service";
import {SavedSet} from "../shared/models/saved-set";
import {ConstraintService} from "../shared/services/constraint.service";
import {DropMode} from "../shared/models/drop-mode";
import {ResourceService} from "../shared/services/resource.service";
import {SelectItem} from "primeng/components/common/api";

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {

  availableSetOptions: SelectItem[];
  selectedAvailableSetOption: string;
  selectedFileFormat: string = "TSV";

  selectedSets: SavedSet[];
  searchResults: any;

  dataFormats: Object[];
  exportTasks: Object[];
  exportTaskName: string;


  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private resourceService: ResourceService,
              private element: ElementRef) {
    let patientOpt: SelectItem = {
      label: 'patient',
      value: 'patient'
    };
    let observationOpt: SelectItem = {
      label: 'observation',
      value: 'observation'
    };
    this.availableSetOptions = [patientOpt, observationOpt];
    this.selectedAvailableSetOption = 'patient';
    this.selectedSets = [];
    this.dataFormats = [];
    this.updateExportTasks();
  }

  ngOnInit() {
  }

  updateExportTasks() {
    this.resourceService.getExportJobs()
      .subscribe(
        tasks => {
          this.exportTasks = tasks;
        },
        err => console.error(err)
      );
  }

  updateDataFormats() {
    if (this.selectedSets.length > 0) {
      let ids: string[] = [];
      for(let set of this.selectedSets) {
        ids.push(set['id']);
      }
      this.resourceService.getExportDataFormats(ids)
        .subscribe(
          formats => {
            this.dataFormats = [];
            for(let name of formats) {
              this.dataFormats.push({
                name: name,
                checked: true
              });
            }
          },
          err => console.error(err)
        );
    }
    else {
      this.dataFormats = [];
    }
  }

  exportSelectedSets() {
    if(this.selectedSets.length > 0) {
      console.log('Export these sets: ', this.selectedSets, ' with name: ', this.exportTaskName);
      this.createExportJob();
    }
  }

  createExportJob() {
    let name = this.exportTaskName ? this.exportTaskName.trim() : undefined;
    this.resourceService.createExportJob(name)
      .subscribe(
        newJob => {
          console.log('new job: ', newJob);
          this.runExportJob(newJob.id);
        },
        err => console.error(err)
      );
  }

  runExportJob(jobId: string) {
    let setOption = this.selectedAvailableSetOption;
    let ids: string[] = [];
    for(let set of this.selectedSets) {
      ids.push(set['id']);
    }
    let elements: Object[] = [];
    let fileFormat: string = this.selectedFileFormat;
    for(let dataFormat of this.dataFormats) {
      elements.push({
        dataType: dataFormat['name'],
        format: fileFormat
      });
    }
    //TODO: export permission to be sorted out
    this.resourceService.runExportJob(jobId, setOption, ids, elements)
      .subscribe(
        returnedExportJob => {
          // TODO: handle returned export job
          console.log('successfully running export job: ', returnedExportJob);
        },
        err => console.log(err)
      );
  }

  onSelect(event) {
    this.updateDataFormats();
  }

  onUnselect(event) {
    // primeng does not update the selected sets,
    // so we need to manually remove the patient set
    let index = this.selectedSets.indexOf(event);
    this.selectedSets.splice(index, 1);
    this.updateDataFormats();
  }

  onSearch(event) {
    let query = event.query.toLowerCase();
    let sets = null;
    if(this.selectedAvailableSetOption === 'patient') {
      sets = this.dimensionRegistry.getPatientSets();
    }
    else if(this.selectedAvailableSetOption === 'observation') {
      sets = this.dimensionRegistry.getObservationSets();
    }

    if (query && sets) {
      this.searchResults = sets.filter(
        (set: SavedSet) => (set.name && set.name.toLowerCase().includes(query))
      );
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
    this.updateDataFormats();
  }

}
