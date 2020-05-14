import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { CryptoService } from './crypto.service';
import { SurvivalCohort } from 'app/models/cohort-models/cohort';
import { MedcoNetworkService } from './api/medco-network.service';
import { Observable,of } from 'rxjs';
import {map} from 'rxjs/operators';
import { ExploreSearchService } from './api/medco-node/explore-search.service';
import { SurvivalAnalysisService } from './api/survival-analysis.service';
import {SurvivalAnalysisClear} from 'app/models/survival-analysis/survival-analysis-clear'


@Injectable()
export class SurvivalService {
  protected _id :string
  protected _patientGroupIds :Map<string, number[]> //one string[] per node
  protected _timeCodes : {name : string, encID? :number}[] //clear encID of timepoints

  protected _granularity : {name : string, encID? :number}[]




  constructor(protected authService : AuthenticationService,
    protected cryptoService : CryptoService,
    protected medcoNetworkService: MedcoNetworkService,
    protected exploreSearchService: ExploreSearchService,
    protected apiSurvivalAnalysisService: SurvivalAnalysisService) {
      medcoNetworkService.nodes.forEach((apiNodeMetadata=>
        {this._patientGroupIds[apiNodeMetadata.name]=new Array<string>()}
        ).bind(this))


    }

  //get the granularity names and, if those are encrypted-deterministcally-tagged, 
   retrievedEncIDs() :Observable<{name : string, encID? :number}[]>{
    return this.exploreSearchService.exploreSearch(`/SurvialAnalysis/Time/${this._granularity}`).pipe(
      map(x=>x.map(
        y=>{
          var name =y.displayName
          if (y.encryptionDescriptor.encrypted){
            return { name:name,
              encID: y.encryptionDescriptor.id
            }
          }
          else{
            return {name:name}
          }
        }
      ))
    )
  }

  
   buildFromCohort(survivalCohort : SurvivalCohort){
    this._id=survivalCohort._name
    this.retrievedEncIDs().subscribe((x=>this._timeCodes=x).bind(this))
    survivalCohort.subGroups.forEach((subGroup=>{
      subGroup.patient_set_id.forEach(((value,key)=>{
        this._patientGroupIds[key].push(value)
      }).bind(this))
    }).bind(this))


  }



}



@Injectable()
export class SurvivalAnalysisServiceMock extends SurvivalService{

  constructor(protected authService : AuthenticationService,
    protected cryptoService : CryptoService,
    protected medcoNetworkService: MedcoNetworkService,
    protected exploreSearchService: ExploreSearchService,
    protected apiSurvivalAnalysisService: SurvivalAnalysisService){
      super(authService,cryptoService, medcoNetworkService, exploreSearchService,apiSurvivalAnalysisService)
    }

    retrievedEncIDs() :Observable<{name : string, encID? :number}[]>{
      return of([{name:"1",encId:1},
      {name:"2",encId:2},
      {name:"3",encId:3},
      {name:"4",encId:4},
      {name:"5",encId:5},
      {name:"6",encId:6},
      {name:"7",encId:7},
      {name:"8",encId:8},
      {name:"9",encId:9}])
    }

    buildFromCohort(survivalCohortNotToBeUsed : SurvivalCohort){
        this._id="mocksurvival"
        this.retrievedEncIDs().subscribe((x=>this._timeCodes=x).bind(this))
        this._patientGroupIds= new Map<string,number[]>()
        this._patientGroupIds["0"]=[0,1,2,3]
        this._patientGroupIds["1"]=[0,1,2,3]
        this._patientGroupIds["2"]=[0,1,2,3]


    }

    execute(): Observable<SurvivalAnalysisClear>{

      var srva=new SurvivalAnalysisClear()
      srva.results=[{groupId:"0",
      groupResults:[
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        
      ]
    },
    {groupId:"1",
    groupResults:[
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      {events:{censoringEvent:2,eventOfInterest:4},
      timepoint:1},
      
    ]
  },
  {groupId:"2",
  groupResults:[
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    {events:{censoringEvent:2,eventOfInterest:4},
    timepoint:1},
    
  ]
},
{groupId:"3",
      groupResults:[
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        {events:{censoringEvent:2,eventOfInterest:4},
        timepoint:1},
        
      ]
    }]
      return of(srva)

    }

}
