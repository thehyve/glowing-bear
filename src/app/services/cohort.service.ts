/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { Cohort, SurvivalCohort } from 'app/models/cohort-models/cohort';
import { Observable, of,Subject } from 'rxjs';
import {map,tap} from 'rxjs/operators'
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { ExploreQuery } from 'app/models/query-models/explore-query';
import { ExploreQueryType } from 'app/models/query-models/explore-query-type';
import { MedcoNetworkService } from './api/medco-network.service';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintService } from './constraint.service';
import { ExploreCohortsService } from './api/medco-node/explore-cohorts.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { ApiCohort } from 'app/models/api-request-models/medco-node/api-cohort';

@Injectable()
export class CohortService {

  protected _cohorts: Array<Cohort>
  protected _selectedCohort : Cohort
  protected _selectingCohort : Subject<Cohort>
  protected _nodeName:Array<string>

  protected _isRefreshing:boolean
  public restoring: Subject<boolean>
  
  constructor(
    protected exploreCohortsService: ExploreCohortsService,
    protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService: MedcoNetworkService,
    protected constraintService: ConstraintService) {
      this.restoring=new Subject<boolean>()
      this._selectingCohort= new Subject<Cohort> ()
      this._nodeName=new Array<string>(this.medcoNetworkService.nodes.length)
      this.medcoNetworkService.nodes.forEach((apiMetadata=>{
        this._nodeName[apiMetadata.index]=apiMetadata.name
      }).bind(this))

      this._cohorts= new Array<Cohort>()
    }

  get cohorts (){
    return this._cohorts
  }
  get selectedCohort(){
    return this._selectedCohort 
  }
  get selectingCohort() : Observable<Cohort>
  {
    return this._selectingCohort as Observable<Cohort>
  }
  set selectedCohort(cohort : Cohort){
    if(this._selectedCohort){
      this._selectedCohort.selected=false
    }
    this._selectedCohort=cohort
    this._selectedCohort.selected=true
    this._selectingCohort.next(cohort)
  }

  set cohorts(cohorts : Array<Cohort>){
    this._cohorts= cohorts.map(x => x)
  }
  get isRefreshing():boolean{
    return this._isRefreshing
  }

  addSubgroupToSelected(name:string,rootInclusionConstraint:CombinationConstraint,rootExclusionConstraint:CombinationConstraint){
    var subGroup=new Cohort(name,rootInclusionConstraint,rootExclusionConstraint,new Date(Date.now()),new Date(Date.now()))
    if(this._selectedCohort instanceof SurvivalCohort){
      (this._selectedCohort as SurvivalCohort).hasSubGroups=true;
      
      (this._selectedCohort as SurvivalCohort).subGroups.push(subGroup);
    }else{
      var idx= this._cohorts.indexOf(this._selectedCohort)
      var ret = new SurvivalCohort(this._selectedCohort.name,this.selectedCohort.rootInclusionConstraint,this.selectedCohort.rootExclusionConstraint, new Date(Date.now()),new Date(Date.now()))
      ret.hasSubGroups=true
      ret.subGroups.push(subGroup)
      this._cohorts[idx]=ret
      this.selectedCohort=ret

    }
  }
  getCohorts(){
    this._isRefreshing=true
    this.exploreCohortsService.getCohortAllNodes().subscribe(
      (apiCohorts => {
        this.upsertCohorts(apiCohortsToCohort(apiCohorts))
        this._isRefreshing=false
      }).bind(this),
      (err=>{
        console.log("An error occured while retrieving saved cohorts: ", err)
        MessageHelper.alert('error',"An error occured while retrieving saved cohorts",err)
        this._isRefreshing=false
        
      }).bind(this),
      (()=> {
        MessageHelper.alert('',"Saved cohorts successfully retrieved")
      this._isRefreshing=false}).bind(this)
    )
  }

  upsertCohorts(cohorts : Cohort[]){
    var tmp= new Map<string,Date>()
    this._cohorts.forEach(cohort=>{tmp.set(cohort.name,cohort.updateDate)})
    cohorts.forEach(cohort=>{
      if (tmp.has(cohort.name)){
        if( cohort.updateDate > tmp.get(cohort.name)){
          var i =this._cohorts.findIndex(c => c.name ==cohort.name)
          this._cohorts[i]=cohort
        }
      }else{
        this._cohorts.push(cohort)
        tmp.set(cohort.name,cohort.updateDate)
      }
    })

  }

 

  
  //from view to cached

  addCohort(name :string){

  }

  updateCohortTerms(constraint : CombinationConstraint){
    this._selectedCohort.rootInclusionConstraint= constraint
  }


  // from cached to view
  restoreTerms() :void{
    this.constraintService.rootInclusionConstraint=this.selectedCohort.rootInclusionConstraint
    this.constraintService.rootExclusionConstraint=this.selectedCohort.rootExclusionConstraint
    this.restoring.next(true)
  }

  

  executeSubgroupQuery(idx :number) : Observable<Error>{

    //TODO : redo the query with the root exclusions constraint
    if (!(this._selectedCohort instanceof SurvivalCohort)){
    return  of(Error("the cohort was not set as survival cohort"))

    }

    if (  ! this._selectedCohort._hasSubGroups){
      return of(null)
    }

    var subGroup=this._selectedCohort._subGroups[idx]

    var query= new ExploreQuery
    query.superSetId=this._selectedCohort.patient_set_id
    query.type=ExploreQueryType.PATIENT_SET
    query.constraint=subGroup.rootInclusionConstraint
    this.exploreQueryService.exploreQuery(query).pipe(map(queryResults=>{ let err=null
      queryResults.forEach(((queryResult,nodeIndex)=>{
        if (queryResult.status ==="error"){
          err=Error("error during the execution of the queries related to sub groups")
        }else if (queryResult.status =="available"){
          subGroup.patient_set_id[this._nodeName[nodeIndex]]=queryResult.patientSetId

        }else{
          err=Error("query status handling not implemented yet")

        }
      }).bind(this))
      return err
    }))
  }
  
}





@Injectable()
export class CohortServiceMock extends CohortService {

  constructor(protected exploreCohortsService:ExploreCohortsService, protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService : MedcoNetworkService,public constraintService: ConstraintService){
    super(exploreCohortsService,exploreQueryService,medcoNetworkService,constraintService)
  }

  executeSubgroupQuery(idx:number):Observable<Error>{
    this._nodeName.forEach((nodeName=>{
      (this._selectedCohort as SurvivalCohort)._subGroups[idx].patient_set_id[nodeName]=1
    }).bind(this))

    return of(null)
  }

}

function apiCohortsToCohort(apiCohorts: ApiCohort[][]) : Cohort[]{

  const  cohortNumber= apiCohorts[0].length
  apiCohorts.forEach(apiCohort =>{if (apiCohort.length != cohortNumber) throw(Error("cohort numbers are not the same across nodes"))})

  var cohortName, creationDate,updateDate: string
  var res = new Array<Cohort>()
  for (let i = 0; i < cohortNumber; i++) {
    cohortName=apiCohorts[0][i].cohortName
    apiCohorts.forEach(apiCohort =>{if (apiCohort[i].cohortName!= cohortName) throw(Error("cohort names are not the same across nodes"))})
    creationDate=apiCohorts[0][i].creationDate
    apiCohorts.forEach(apiCohort =>{if (apiCohort[i].creationDate != creationDate) throw(Error("cohort creation dates are not the same across nodes"))})
    updateDate=apiCohorts[0][i].updateDate
    apiCohorts.forEach(apiCohort =>{if (apiCohort[i].updateDate != updateDate) throw(Error("cohort update dates are not the same across nodes"))})
    var cohort=new Cohort(cohortName,null,null,new Date(creationDate),new Date(updateDate))
    
    cohort.patient_set_id=apiCohorts.map(apiCohort=>apiCohort[i].queryId)
    res.push(cohort)

  }
  return res
    
}