import { SurvivalCurve, survivalPoints } from "../survival-analysis/survival-curves";
import { AttrAst } from "@angular/compiler";



type Mat =Array<Array<number>>


function buildMatrix( survivalCurve : SurvivalCurve): Mat{
    let res: Mat
    var len =survivalCurve.curves.length
    res=new Array<Array<number>>(len)
    for (let index = 0; index < len; index++) {
        var points=survivalCurve.curves[index].points
        var nofPoints=points.length
        res[index]=new Array<number>(nofPoints)
        for(let j =0; j< nofPoints;j++){
            res[index][j]=points[j].nofEvents
        }
    }

    return res
}

    
function aggrex(x : Mat) :Array<number>{
    let res =new  Array<number>(x.length)
    for (let index =0;index<x.length;index++){
        x[index].forEach(d=>{res[index]+=d})
    }
    return res
}


class Aggrex{

    private counter:number
    private _aggregata:Array<number>


    constructor(private X:Mat){
        this._aggregata=aggrex(X)
        this.counter=0
    }


    next():boolean{
        if (this.counter==this.X[0].length){
            return true
        }
        for (let index = 0; index < aggrex.length; index++) {
            this.aggregata[index]-=this.X[index][this.counter]   
        }
        return false
    }

    get aggregata(): Array<number>{
        return this._aggregata
    }
}


