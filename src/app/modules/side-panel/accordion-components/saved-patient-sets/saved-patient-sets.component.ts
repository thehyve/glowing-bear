import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {SavedSet} from '../../../shared/models/saved-set';
import {DropMode} from '../../../shared/models/drop-mode';

@Component({
  selector: 'saved-patient-sets',
  templateUrl: './saved-patient-sets.component.html',
  styleUrls: ['./saved-patient-sets.component.css']
})
export class SavedPatientSetsComponent implements OnInit, AfterViewInit {

  patientSets: SavedSet[];
  observer: MutationObserver;
  collapsed = false;

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    this.patientSets = this.dimensionRegistry.getPatientSets();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    const config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }

  update() {
    let panels = this.element.nativeElement.querySelectorAll('.gb-patient-set-panel');
    let index = 0;
    for (let panel of panels) {
      let correspondingPatientSet = this.patientSets[index];
      panel.addEventListener('dragstart', (function () {
        correspondingPatientSet['dropMode'] = DropMode.PatientSet;
        this.constraintService.selectedNode = correspondingPatientSet;
      }).bind(this));
      index++;
    }
  }

  togglePatientSetPanel(patientSet) {
    patientSet['collapsed'] = !patientSet['collapsed'];
  }

  getPatientSetToggleButtonIcon(patientSet) {
    return patientSet['collapsed'] ? 'fa-angle-down' : 'fa-angle-up';
  }

  togglePatientSetBookmark(patientSet) {
    patientSet['bookmarked'] = !patientSet['bookmarked'];
  }

  getPatientSetBookmarkButtonIcon(patientSet) {
    return patientSet['bookmarked'] ? 'fa-star' : 'fa-star-o';
  }

  selectPatientSet(patientSet) {
    for (let set of this.patientSets) {
      set['selected'] = false;
    }
    patientSet['selected'] = true;
    // TODO: fill the patient selection accordion with the selected patient set query
  }

  getPatientSetSelectionButtonIcon(patientSet) {
    return patientSet['selected'] ? 'fa-arrow-circle-right' : 'fa-arrow-circle-o-right';
  }

  removePatientSet(patientSet) {
    // TODO: implement removing patient set
    console.log('remove patient set: ', patientSet);
  }

  editPatientSetName(event, patientSet) {
    event.preventDefault();
    event.stopPropagation();
    patientSet['nameEditable'] = true;
  }

  onPatientSetPanelClick(patientSet) {
    patientSet['nameEditable'] = false;
  }
}
