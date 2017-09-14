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

  togglePatientSetPanel(pset) {
    pset['collapsed'] = !pset['collapsed'];
  }

  getPatientSetToggleButtonIcon(patientSet) {
    return patientSet['collapsed'] ? 'fa-angle-down' : 'fa-angle-up';
  }

  removePatientSet(patientSet) {
    // TODO: implement removing patient set
    console.log('remove patient set: ', patientSet);
  }
}
