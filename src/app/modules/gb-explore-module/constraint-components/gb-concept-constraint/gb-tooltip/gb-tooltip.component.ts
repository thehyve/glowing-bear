/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Inject, Input, OnInit } from "@angular/core";
import { ValueType } from "src/app/models/constraint-models/value-type";
import { GbConceptConstraintComponent } from "../gb-concept-constraint.component";

@Component({
  selector: 'gb-tooltip',
  templateUrl: './gb-tooltip.component.html',
  styleUrls: ['./gb-tooltip.component.css']
})
export class GbTooltipComponent implements OnInit {

  infos: string;

  constructor(@Inject(GbConceptConstraintComponent) private parentConcept: GbConceptConstraintComponent) {
    this.infos = this.parentConcept.selectedConcept.comment
  }

  canDisplay(): boolean {
    return (this.parentConcept.constraintConcept.type === ValueType.TEXT && this.parentConcept.textOperatorState !== null) ||
      (this.parentConcept.constraintConcept.type === ValueType.NUMERICAL && this.parentConcept.numericalOperatorState !== null);
  }


  ngOnInit() {
  }
}
