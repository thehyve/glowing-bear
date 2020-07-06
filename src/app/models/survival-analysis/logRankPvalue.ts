/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalPoint, ChiSquaredCdf } from "./survival-curves";


 /**
  * This implement the Mantel - Haenszel test (logrank test)
  */


 export function logRank2Groups(group1 : Array<SurvivalPoint>,group2: Array<SurvivalPoint>) : number{
      //declare variables
      var atRisk= new Map<number,number>()
      var events = new Map<number,number>()
      

      var diffsGroup=0
      var varianceGroup= 0
      var atRiskGroup1= new Map<number,number>()
      var atRiskGroup2= new Map<number,number>()
      var eventsGroup1= new Map<number,number>()
      var eventsGroup2 = new Map<number,number>()

      //compute total remaining
      atRisk=computeTotalRisks([group1,group2])


      //feed variables
        for (let j = 0; j < group1.length; j++) {
            var point =group1[j]
            
            if (point.nofEvents >0){
                events.set(point.timePoint,events.has(point.timePoint) ? events.get(point.timePoint)+point.nofEvents:point.nofEvents)
                atRiskGroup1.set(point.timePoint,atRiskGroup1.has(point.timePoint) ? atRiskGroup1.get(point.timePoint)+point.atRisk:point.atRisk)
                eventsGroup1.set(point.timePoint,eventsGroup1.has(point.timePoint) ? eventsGroup1.get(point.timePoint)+point.nofEvents:point.nofEvents)

            } 
        }
        for (let j=0; j < group2.length ; j++){
            var point= group2[j]

            if (point.nofEvents>0){

                events.set(point.timePoint,events.has(point.timePoint) ? events.get(point.timePoint)+point.nofEvents:point.nofEvents)
                atRiskGroup2.set(point.timePoint,atRiskGroup2.has(point.timePoint) ? atRiskGroup2.get(point.timePoint)+point.atRisk:point.atRisk)
                eventsGroup2.set(point.timePoint,eventsGroup2.has(point.timePoint) ? eventsGroup2.get(point.timePoint)+point.nofEvents:point.nofEvents)

            }
        } 
        

      // process

      events.forEach((nofEvents,timePoint)=>{

          
          
          var risks=atRisk.get(timePoint)
          var estimate=nofEvents/risks


          var risk1=atRiskGroup1.has(timePoint) ? atRiskGroup1.get(timePoint) : risks-atRiskGroup2.get(timePoint)
          var event1=eventsGroup1.has(timePoint) ? eventsGroup1.get(timePoint):0

              
        diffsGroup+= event1 - risk1* estimate

        varianceGroup += (risks==risk1 || risks<=1) ? 0: risk1 *estimate*(risks-nofEvents)*(risks-risk1) / (risks * (risks-1))              
          
      })

     

      

    var res= (diffsGroup==0) ?0: Math.pow(diffsGroup,2)/varianceGroup
          

      console.log("results",diffsGroup,varianceGroup,res)
      return 1-ChiSquaredCdf(res,1)


  }

  function computeTotalRisks(groups:Array<Array<SurvivalPoint>>):Map<number,number>{
    var res=new Map<number,number>()  
    //initial value
      var remaining =groups.map(group=>(group.length >0) ? group[0].atRisk:0).reduce((a,b)=>a+b)

      //naive merge
      var commonArray=groups.reduce((a,b)=>a.concat(b))
      commonArray =commonArray.sort((a,b)=>a.timePoint -b.timePoint)
      //add together same time point

      var subtractions = new Map<number,number>()
      commonArray.forEach(point=>{
          subtractions.set(point.timePoint,
            point.nofCensorings+point.nofEvents + ((subtractions.has(point.timePoint))?subtractions.get(point.timePoint):0) )


      })

   
    var previousTimePoint=-1
    var remainings=new Map<number,number>()
    commonArray.forEach(point=>{
        if(point.timePoint !=previousTimePoint){
            remainings.set(point.timePoint,remaining)
            remaining -=subtractions.get(point.timePoint)
            previousTimePoint=point.timePoint
        }
    })
    return remainings

      
  }

//answer should be  for xi2 should be2.88
export const logranktest:Array<Array<SurvivalPoint>>=[
    [
        {
            timePoint:1,
            prob:0,
            cumul:0,
            cumulCensorings:0,
            cumulEvents:0,
            remaining:1,
            atRisk: 2, //at risk at instant t, it is equivalent to remaining +censorings +events
            nofEvents:1,
          nofCensorings:0,
          },{
            timePoint:2,
            prob:0,
            cumul:0,
            cumulCensorings:0,
            cumulEvents:0,
            remaining:0,
            atRisk: 1, //at risk at instant t, it is equivalent to remaining +censorings +events
            nofEvents:1,
          nofCensorings:0,
          }

    ],[{
        timePoint:3,
        prob:0,
        cumul:0,
        cumulCensorings:0,
        cumulEvents:0,
        remaining:1,
        atRisk: 2, //at risk at instant t, it is equivalent to remaining +censorings +events
        nofEvents:1,
      nofCensorings:0,
      },{
        timePoint:4,
        prob:0,
        cumul:0,
        cumulCensorings:0,
        cumulEvents:0,
        remaining:0,
        atRisk: 1, //at risk at instant t, it is equivalent to remaining +censorings +events
        nofEvents:1,
      nofCensorings:0,
      }

    ]

]