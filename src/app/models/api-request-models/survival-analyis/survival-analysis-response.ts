/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export class ApiSurvivalAnalysisResponse {
    results:{groupID: string
             initialCount : string
             groupResults: {timepoint:number
                            events:{eventofinterest:string
                                    censoringevent:string
                                    
                            }}[]}[]
    
}