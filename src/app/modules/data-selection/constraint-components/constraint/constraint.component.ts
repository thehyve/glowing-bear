import {Component, OnInit, Input, EventEmitter, Output, ElementRef} from '@angular/core';
import {Constraint} from "../../../shared/models/constraints/constraint";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";
import {ConstraintService} from "../../../shared/services/constraint.service";
import {ResourceService} from "../../../shared/services/resource.service";

@Component({
  selector: 'constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['./constraint.component.css']
})
export class ConstraintComponent implements OnInit {
  @Input() constraint: Constraint;
  @Input() isRoot: boolean;
  @Output() constraintRemoved: EventEmitter<any> = new EventEmitter();

  constructor(protected dimensionRegistry: DimensionRegistryService,
              protected resourceService:ResourceService,
              protected constraintService: ConstraintService,
              protected element: ElementRef) {
  }

  ngOnInit() {
    this.addEventListeners();
  }

  /**
   * Emits the constraintRemoved event, indicating the constraint corresponding
   * to this component is to be removed from its parent.
   */
  remove() {
    this.constraintRemoved.emit();
  }

  addEventListeners() {
    let elm = this.element.nativeElement;
    elm.addEventListener('dragenter', this.onDragEnter.bind(this), false);
    elm.addEventListener('dragover', this.onDragOver.bind(this), false);
    elm.addEventListener('dragleave', this.onDragLeave.bind(this), false);
    elm.addEventListener('drop', this.onDrop.bind(this), false);
  }

  onDragEnter(event) {
    this.element.nativeElement.firstChild.classList.add('dropzone');
  }

  onDragOver(event) {
    event.preventDefault();
    this.element.nativeElement.firstChild.classList.add('dropzone');
  }

  onDragLeave(event) {
    this.element.nativeElement.firstChild.classList.remove('dropzone');
  }

  onDrop(event) {
    this.element.nativeElement.firstChild.classList.remove('dropzone');
  }
}
