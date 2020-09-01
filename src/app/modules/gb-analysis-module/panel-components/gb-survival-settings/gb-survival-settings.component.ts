/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Concept } from 'app/models/constraint-models/concept';
import { ConstraintService } from 'app/services/constraint.service';

@Component({
  selector: 'app-gb-survival-settings',
  templateUrl: './gb-survival-settings.component.html',
  styleUrls: ['./gb-survival-settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class GbSurvivalSettingsComponent implements OnInit {
  _activated: boolean

  _granularities= [{label:"Day",value:"Day"},{label:"Week",value:"Week"},{label:"Month",value:"Month"},{label:"Year",value:"Year"}]
  _selectedGranularity="Day"

  _limit=2000

  _starts=[{label:"Diagnosis",value:"Diagnosis"},{label:"Treatment",value:"Treatment"}]
  _selectedStart="Treatment"

  _ends=[{label:"Fatality",value:"Fatility"},{label:"Tumor Growth",value:"Tumor Growth"}]
  _selectedEnd="Fatality"

  _startConcept: Concept
  _suggestedStartConcepts: Concept[]
  _endConcept : Concept
  _suggestedEndConcepts: Concept[]

  

  constructor(private constraintService : ConstraintService) { }

  ngOnInit() {
  }

  search(event){

      var q = event.query.toLowerCase();

      var concepts = this.constraintService.concepts;
      console.log("q",q,"concepts",concepts)
      if (q) {
        this.suggestedStartConcepts = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(q));
      } else {
        this.suggestedStartConcepts = concepts;
      }
    
  }

  list(event){
    this.suggestedStartConcepts = this.constraintService.concepts;

  }

  @Input()
  set activated(bool : boolean){
    this._activated=bool
  }

  get activated():boolean{
    return this._activated
  }


  get granularities(){
    return this._granularities
  }

  get selectedGranularity():string{
    return this._selectedGranularity
  }

  set selectedGranularity(gran:string){
    this._selectedGranularity=gran
  }

  get limit() : number{
    return this._limit
  }

  set limit(num:number){
    this._limit=num
  }

  get starts(){
    return this._starts
  }

  set selectedStart(end:string){
    this._selectedStart=end
  }

  get selectedStart():string{
    return this._selectedStart
  }

  get ends(){
    return this._ends
  }

  set selectedEnd(end:string){
    this._selectedEnd=end
  }

  get selectedEnd():string{
    return this._selectedEnd
  }
  set startConcept(concept: Concept){
    this._startConcept=concept
  }
  get startConcept(): Concept{
    return this._startConcept
  }
  set endConcept(concept: Concept){
    this._startConcept=concept
  }
  get endConcept(): Concept{
    return this._startConcept
  }
  set suggestedStartConcepts(concepts: Concept[]){
    this._suggestedStartConcepts=concepts
  }
  get suggestedStartConcepts(): Concept[]{
    return this._suggestedStartConcepts
  }
  set suggestedEndConcepts(concepts: Concept[]){
    this._suggestedEndConcepts=concepts
  }
  get suggestedEndConcepts(): Concept[]{
    return this._suggestedEndConcepts
  }


}
