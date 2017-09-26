import {Component, OnInit} from '@angular/core';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {SavedSet} from '../../models/saved-set';
import {ConstraintService} from '../../services/constraint.service';
import {DropMode} from '../../models/drop-mode';
import {ResourceService} from '../../services/resource.service';
import {SelectItem} from 'primeng/components/common/api';
import {SimpleTimer} from 'ng2-simple-timer';
import {Response} from '@angular/http';
import {ExportJob} from '../../models/export-job';
import {animate, style, transition, trigger} from '@angular/animations';

type LoadingState = 'loading' | 'complete';

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
  animations: [
    trigger('notifyState', [
      transition('loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 0.5)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class ExportComponent implements OnInit {

  selectedFileFormat = 'TSV';
  alertMessages = [];

  selectedSets: SavedSet[];
  searchResults: any;

  dataFormats: Object[];
  updatingDataFormats: LoadingState;
  exportJobs: ExportJob[];
  exportJobName: string;

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private resourceService: ResourceService,
              private timer: SimpleTimer) {
    this.selectedSets = [];
    this.dataFormats = [];
    this.updatingDataFormats = 'complete';
    this.updateExportJobs();
    this.timer.newTimer('30sec', 30);
    this.timer.subscribe('30sec', () => this.updateExportJobs());
  }

  ngOnInit() {
  }

  updateExportJobs() {
    this.resourceService.getExportJobs()
      .subscribe(
        jobs => {
          this.exportJobs = jobs;
        },
        err => console.error(err)
      );
  }

  /**
   * Update the data formats checkboxes whenever there is a change to the set selection
   */
  updateDataFormats() {
    if (this.selectedSets.length > 0) {
      this.updatingDataFormats = 'loading';
      this.dataFormats = [];
      let ids: string[] = [];
      for (let set of this.selectedSets) {
        ids.push(set['id']);
      }
      this.resourceService.getExportDataFormats(ids)
        .subscribe(
          formats => {
            for (let name of formats) {
              this.dataFormats.push({
                name: name,
                checked: true
              });
            }
            this.updatingDataFormats = 'complete';
          },
          err => console.error(err)
        );
    } else {
      this.dataFormats = [];
    }
  }

  /**
   * Create the export job when the user clicks the 'Export selected sets' button
   */
  createExportJob() {
    if (this.selectedSets.length > 0) {
      let name = this.exportJobName ? this.exportJobName.trim() : undefined;
      let duplicateName = false;
      for (let job of this.exportJobs) {
        if (job['jobName'] === name) {
          duplicateName = true;
          break;
        }
      }

      if (duplicateName) {
        this.alertMessages.push({severity: 'info', summary: 'Duplicate job name, choose a new name.', detail: ''});
      } else {
        this.alertMessages = [];
        this.alertMessages.push({severity: 'info', summary: 'Running the export job "' + name + '".', detail: ''});
        this.resourceService.createExportJob(name)
          .subscribe(
            newJob => {
              this.alertMessages = [];
              this.alertMessages.push({severity: 'info', summary: 'The export job "' + name + '" is created.', detail: ''});
              this.runExportJob(newJob);
            },
            err => console.error(err)
          );
      }
    }
  }

  /**
   * Run the just created export job
   * @param job
   */
  runExportJob(job) {
    let jobId = job['id'];
    let ids: string[] = [];
    for (let set of this.selectedSets) {
      ids.push(set['id']);
    }
    let elements: Object[] = [];
    let fileFormat: string = this.selectedFileFormat;
    for (let dataFormat of this.dataFormats) {
      elements.push({
        dataType: dataFormat['name'],
        format: fileFormat,
        tabular: true
      });
    }

    this.resourceService.runExportJob(jobId, ids, elements)
      .subscribe(
        returnedExportJob => {
          this.alertMessages = [];
          let msg = 'The export job "' + returnedExportJob['jobName'] + '" is ready for download.';
          this.alertMessages.push({severity: 'info', summary: msg, detail: ''});
          this.updateExportJobs();
        },
        err => console.error(err)
      );
  }

  /**
   * When an export job's status is 'completed', the user can click the Download button,
   * then the files of that job can be downloaded
   * @param job
   */
  downloadExportJob(job) {
    this.resourceService.downloadExportJob(job.id)
      .subscribe(
        (response: Response) => {
          let resBlob = response.blob();
          let length = resBlob.size;
          let blob = new Blob([response.blob()], {type: 'application/zip'});

          /*
           * The document anchor click approach
           * Alternative: The file-saver approach: FileSaver.saveAs(blob, `${job.jobName}.zip`);
           */
          let url = window.URL.createObjectURL(blob);
          let anchor = document.createElement('a');
          anchor.download = `${job.jobName}.zip`;
          anchor.href = url;
          anchor.click();
          anchor.remove();
        },
        err => console.error(err),
        () => {
        }
      );
  }

  /**
   * The user can add a set that he wants to export
   * @param event
   */
  onSelect(event) {
    this.updateDataFormats();
  }

  /**
   * The user can remove a set that he wants to exclude from export
   * @param event
   */
  onUnselect(event) {
    // primeng does not update the selected sets,
    // so we need to manually remove the patient set
    let index = this.selectedSets.indexOf(event);
    this.selectedSets.splice(index, 1);
    this.updateDataFormats();
  }

  /**
   * The user can search for a specific set that he wants to export
   * @param event
   */
  onSearch(event) {
    let query = event.query.toLowerCase();
    let sets = this.dimensionRegistry.getPatientSets().concat(this.dimensionRegistry.getObservationSets());

    if (query && sets) {
      this.searchResults = sets.filter(
        (set: SavedSet) => (set.name && set.name.toLowerCase().includes(query))
      );
    } else {
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

  onExportJobNameInputDrop(event) {
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
