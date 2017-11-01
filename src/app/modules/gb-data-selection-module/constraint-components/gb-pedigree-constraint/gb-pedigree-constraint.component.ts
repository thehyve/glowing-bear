import { Component, OnInit } from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';

@Component({
  selector: 'gb-pedigree-constraint',
  templateUrl: './gb-pedigree-constraint.component.html',
  styleUrls: ['./gb-pedigree-constraint.component.css']
})
export class GbPedigreeConstraintComponent extends GbConstraintComponent implements OnInit {

  ngOnInit() {
  }

}
