import {
  Component, OnInit, ViewChild, ElementRef, Renderer2
} from '@angular/core';
import {
  trigger, state, style, animate, transition
} from '@angular/animations';
import {ConstraintComponent} from "../../constraint-components/constraint/constraint.component";
import {CombinationConstraint} from "../../../shared/models/constraints/combination-constraint";
import {ConstraintService} from "../../../shared/services/constraint.service";


@Component({
  selector: 'patient-selection',
  templateUrl: './patient-selection.component.html',
  styleUrls: ['./patient-selection.component.css'],
  animations: [
    trigger('notifyState', [
      state('loading', style({
        display: 'none'
      })),
      transition( 'loading => complete', [
        style({
          background: 'rgba(51, 156, 144, 1.0)'
        }),
        animate('1000ms ease-out', style({
          background: 'rgba(255, 255, 255, 0.0)'
        }))
      ])
    ])
  ]
})
export class PatientSelectionComponent implements OnInit {

  patientSetName: string = "";
  selectedCriteriaBox: ElementRef = null;
  @ViewChild('inclusionCriteriaBox') inclusionCriteriaBox: ElementRef;
  @ViewChild('exclusionCriteriaBox') exclusionCriteriaBox: ElementRef;

  @ViewChild('rootInclusionConstraintComponent') rootInclusionConstraintComponent: ConstraintComponent;
  @ViewChild('rootExclusionConstraintComponent') rootExclusionConstraintComponent: ConstraintComponent;

  constructor(private _constraintService: ConstraintService) {
  }

  ngOnInit() {
    this.constraintService.update();
    this.addDragDropListeners();
  }

  get constraintService(): ConstraintService {
    return this._constraintService;
  }

  get patientCount(): number {
    return this.constraintService.patientCount;
  }

  get inclusionPatientCount(): number {
    return this.constraintService.inclusionPatientCount;
  }

  get exclusionPatientCount(): number {
    return this.constraintService.exclusionPatientCount;
  }

  get rootInclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootInclusionConstraint;
  }

  get rootExclusionConstraint(): CombinationConstraint {
    return this.constraintService.rootExclusionConstraint;
  }

  savePatientSet() {
    this.constraintService.savePatients(this.patientSetName);
  }

  onInclusionDragEnter(event) {
    this.inclusionCriteriaBox.nativeElement.classList.add('dropzone');
    this.selectedCriteriaBox = this.inclusionCriteriaBox;
  }

  onExclusionDragEnter(event) {
    this.exclusionCriteriaBox.nativeElement.classList.add('dropzone');
    this.selectedCriteriaBox = this.exclusionCriteriaBox;
  }

  onDragOver(event) {
    // prevent default to allow drop
    // event.preventDefault();
    this.selectedCriteriaBox.nativeElement.classList.add('dropzone');
  }

  onDragLeave(event) {
    this.selectedCriteriaBox.nativeElement.classList.remove('dropzone');
  }

  onDragEnd(event) {
    if(this.selectedCriteriaBox) this.selectedCriteriaBox.nativeElement.classList.remove('dropzone');
    this.constraintService.selectedTreeNode = null;
  }

  addDragDropListeners() {
    let inclusionElm = this.inclusionCriteriaBox.nativeElement;
    inclusionElm.addEventListener('dragenter', this.onInclusionDragEnter.bind(this), false);
    inclusionElm.addEventListener('dragover', this.onDragOver.bind(this), false);
    inclusionElm.addEventListener('dragleave', this.onDragLeave.bind(this), false);

    let exclusionElm = this.exclusionCriteriaBox.nativeElement;
    exclusionElm.addEventListener('dragenter', this.onExclusionDragEnter.bind(this), false);
    exclusionElm.addEventListener('dragover', this.onDragOver.bind(this), false);
    exclusionElm.addEventListener('dragleave', this.onDragLeave.bind(this), false);

    document.body.addEventListener("dragend", this.onDragEnd.bind(this), false);
  }
}
