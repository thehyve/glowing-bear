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

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    this.patientSets = this.dimensionRegistry.getPatientSets();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    var config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }

  update() {
    let pDataList = this.element.nativeElement.querySelector('p-datalist');
    let ul = pDataList.querySelector('.ui-datalist-data');
    let index = 0;
    for(let li of ul.children) {
      let correspondingPatientSet = this.patientSets[index];
      li.addEventListener('dragstart', (function () {
        correspondingPatientSet['dropMode'] = DropMode.PatientSet;
        this.constraintService.selectedNode = correspondingPatientSet;
      }).bind(this));
      index++;
    }
  }

}
