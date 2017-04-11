import {Component, OnInit, Input} from '@angular/core';
import {ResourceService} from "../../../shared/services/resource.service";
import {Constraint} from "../../../shared/models/constraints/constraint";

@Component({
  selector: 'constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['./constraint.component.css']
})
export class ConstraintComponent implements OnInit {
  @Input() constraint: Constraint;

  constructor() {
  }

  ngOnInit() {
  }

  removeSelfComponent() {
    console.log('remove component');
  }
}
