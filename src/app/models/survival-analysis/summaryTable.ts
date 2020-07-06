/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalPoint } from "./survival-curves";

export function summaryTable(points: Array<SurvivalPoint>,milestones: Array<number>):Array<{atRisk:number,event:number}>{
    var milestoneIndex=0
    var cumulAtRisk=points[0].atRisk
    var cumulEvent=0
    var res = new Array<{atRisk:number,event:number}>()
    points.forEach(point =>{
        if (point.timePoint > milestones[milestoneIndex]){
            res.push({atRisk:cumulAtRisk,event:cumulEvent})
            milestoneIndex++
        }
        cumulAtRisk=point.atRisk
        cumulEvent+=point.nofEvents
    })


    //if the observations dont' go as far as the milestones
    for (let i = milestoneIndex; i < milestones.length; i++) {
        res.push({atRisk:cumulAtRisk,event:cumulEvent})
        
    }
    return res
 }