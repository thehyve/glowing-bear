import { Injectable } from '@angular/core';
import { Cohort, SurvivalCohort } from 'app/models/cohort-models/cohort';
import { Constraint } from 'app/models/constraint-models/constraint';
import { Observable, of } from 'rxjs';
import {map,tap} from 'rxjs/operators'
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { ExploreQuery } from 'app/models/query-models/explore-query';
import { ExploreQueryType } from 'app/models/query-models/explore-query-type';
import { MedcoNetworkService } from './api/medco-network.service';

@Injectable()
export class CohortService {

  protected _cohorts: Array<Cohort>
  protected _selectedCohort : Cohort
  protected _nodeName:Array<string>
  
  constructor(
    protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService: MedcoNetworkService) {
      this._nodeName=new Array<string>(this.medcoNetworkService.nodes.length)
      this.medcoNetworkService.nodes.forEach((apiMetadata=>{
        this._nodeName[apiMetadata.index]=apiMetadata.name
      }).bind(this))
    }

  get cohorts (){
    return this._cohorts
  }
  get selectedCohort(){
    return this._selectedCohort
  }

  set selectedCohort(cohort : Cohort){
    this._selectedCohort.selected=false
    this._selectedCohort=cohort
    this._selectedCohort.selected=true
  }

  set cohorts(cohorts : Array<Cohort>){
    this._cohorts= cohorts.map(x => x)
  }


 

  
  //from view to cached

  addCohort(name :string){

  }

  updateCohortTerms(constraint : Constraint){
    this._selectedCohort.constraint= constraint
  }

  changeSelectedCohort(){

  }

  // from cached to view
  restoreTerms() : Constraint{
    return this._selectedCohort.constraint
  }

  

  //from cached to backend (patient set id are always saved in backend)

  saveTerms(): void{

    //todo observable from a apiservice !

  }

  

  executeSubgroupQuery(idx :number) : Observable<CohortError>{
    if (!(this._selectedCohort instanceof SurvivalCohort)){
    return  of(CohortError.NewError("the cohort was not set as survival cohort"))

    }

    if (  ! this._selectedCohort._hasSubGroups){
      return of(null)
    }

    var subGroup=this._selectedCohort._subGroups[idx]

    var query= new ExploreQuery
    query.superSetId=this._selectedCohort.patient_set_id
    query.type=ExploreQueryType.PATIENT_SET
    query.constraint=subGroup.constraint
    this.exploreQueryService.exploreQuery(query).pipe(map(queryResults=>{ let err=null
      queryResults.forEach(((queryResult,nodeIndex)=>{
        if (queryResult.status ==="error"){
          err=CohortError.NewError("error during the execution of the queries related to sub groups")
        }else if (queryResult.status =="available"){
          subGroup._patient_set_id[this._nodeName[nodeIndex]]=queryResult.patientSetId

        }else{
          err=CohortError.NewError("query status handling not implemented yet")

        }
      }).bind(this))
      return err
    }))
  }
  


  //from backend to cached


  restoreCohorts(withQueryTerm: boolean){
    //call http get /cohort functions
  }

}





@Injectable()
export class CohortServiceMock extends CohortService {

  constructor( protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService : MedcoNetworkService){
    super(exploreQueryService,medcoNetworkService)
  }

  executeSubgroupQuery(idx:number):Observable<CohortError>{
    this._nodeName.forEach((nodeName=>{
      (this._selectedCohort as SurvivalCohort)._subGroups[idx].patient_set_id[nodeName]=1
    }).bind(this))

    return of(null)
  }

}


export class CohortError implements Error{
  name: string;
  message: string;
  stack?: string;
  private constructor(name: string, message: string, stack?: string){
    this.name=name;
    this.message=message;
    this.stack=stack;
  }

  static NewError(message : string) : CohortError{
    return new CohortError("cohort service error",message)

  }

  static FromPrevious(E: Error) : CohortError{
    return new CohortError(E.name,E.message,E.stack)
  }
}