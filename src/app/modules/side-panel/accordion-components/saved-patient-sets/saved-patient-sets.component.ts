import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {PatientSet} from "../../../shared/models/patient-set";
import {ResourceService} from "../../../shared/services/resource.service";
import {ConstraintService} from "../../../shared/services/constraint.service";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";

@Component({
  selector: 'saved-patient-sets',
  templateUrl: './saved-patient-sets.component.html',
  styleUrls: ['./saved-patient-sets.component.css']
})
export class SavedPatientSetsComponent implements OnInit, AfterViewInit {

  patientSets: PatientSet[];

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    //TODO: connect to real backend call using resource service
    this.patientSets = this.dimensionRegistry.getPatientSets();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.updateEventListeners();
  }

  updateEventListeners() {
    let pDataList = this.element.nativeElement.querySelector('p-datalist');
    let ul = pDataList.querySelector('.ui-datalist-data');

    let index = 0;
    for(let li of ul.children) {
      let correspondingPatientSet = this.patientSets[index];
      li.addEventListener('dragstart', (function () {
        this.constraintService.selectedSet = correspondingPatientSet;
      }).bind(this));
      index++;
    }

  }

}
