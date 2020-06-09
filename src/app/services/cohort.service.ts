import { Injectable } from '@angular/core';
import { Cohort, SurvivalCohort } from 'app/models/cohort-models/cohort';
import { Constraint } from 'app/models/constraint-models/constraint';
import { Observable, of,Subject } from 'rxjs';
import {map,tap} from 'rxjs/operators'
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { ExploreQueryService } from './api/medco-node/explore-query.service';
import { ExploreQuery } from 'app/models/query-models/explore-query';
import { ExploreQueryType } from 'app/models/query-models/explore-query-type';
import { MedcoNetworkService } from './api/medco-network.service';
import { CombinationConstraint } from 'app/models/constraint-models/combination-constraint';
import { ConstraintService } from './constraint.service';

@Injectable()
export class CohortService {

  protected _cohorts: Array<Cohort>
  protected _selectedCohort : Cohort
  protected _nodeName:Array<string>
  public restoring: Subject<boolean>
  
  constructor(
    protected exploreQueryService: ExploreQueryService,
    protected medcoNetworkService: MedcoNetworkService,
    protected constraintService: ConstraintService) {
      this.restoring=new Subject<boolean>()
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

  set selectedCohort(cohort : Cohort){
    if(this._selectedCohort){
      this._selectedCohort.selected=false
    }
    this._selectedCohort=cohort
    this._selectedCohort.selected=true
    console.log("I have a cohort selected !!!",this)
  }

  set cohorts(cohorts : Array<Cohort>){
    this._cohorts= cohorts.map(x => x)
  }

  addSubgroupToSelected(name:string,rootInclusionConstraint:CombinationConstraint,rootExclusionConstraint:CombinationConstraint){
    var subGroup=new Cohort(name,rootInclusionConstraint,rootExclusionConstraint)
    if(this._selectedCohort instanceof SurvivalCohort){
      (this._selectedCohort as SurvivalCohort).hasSubGroups=true;
      
      (this._selectedCohort as SurvivalCohort).subGroups.push(subGroup);
    }else{
      var idx= this._cohorts.indexOf(this._selectedCohort)
      var ret = new SurvivalCohort(this._selectedCohort.name,this.selectedCohort.rootInclusionConstraint,this.selectedCohort.rootExclusionConstraint)
      ret.hasSubGroups=true
      ret.subGroups.push(subGroup)
      this._cohorts[idx]=ret
      this._selectedCohort=ret

    }
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

  

  //from cached to backend (patient set id are always saved in backend)

  saveTerms(): void{

    //todo observable from a apiservice !

  }

  

  executeSubgroupQuery(idx :number) : Observable<CohortError>{

    //TODO : redo the query with the root exclusions constraint
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
    query.constraint=subGroup.rootInclusionConstraint
    this.exploreQueryService.exploreQuery(query).pipe(map(queryResults=>{ let err=null
      queryResults.forEach(((queryResult,nodeIndex)=>{
        if (queryResult.status ==="error"){
          err=CohortError.NewError("error during the execution of the queries related to sub groups")
        }else if (queryResult.status =="available"){
          subGroup.patient_set_id[this._nodeName[nodeIndex]]=queryResult.patientSetId

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
    protected medcoNetworkService : MedcoNetworkService,public constraintService: ConstraintService){
    super(exploreQueryService,medcoNetworkService,constraintService)
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