/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
function lnorm(x:Array<number>,y:Array<number>,n:number):number{
    var res=0.0
    for (let i = 0; i < x.length; i++) {
        res += Math.pow(Math.abs(x[i]-y[i]),n);
    }

    res=Math.pow(res,1.0/n)

    return res
}

export function l2normCiterion(crit:number) : (x:Array<number>,y:Array<number>)=>boolean{
    return function(x:Array<number>,y:Array<number>){
        return lnorm(x,y,2.0)<crit
    }
}