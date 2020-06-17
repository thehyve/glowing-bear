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

function expMap(x : Mat, beta:Array<number>):Array<number>{
    var expArray =Array<number>(x[0].length)
    for (let i = 0; i < x.length; i++) {
        
        for (let j = 0; j < x[i].length; j++) {
            expArray[j]+=x[i][j]*beta[i] 
        }
    }
    return expArray
}

function derivative(x:Mat, expMap :Array<number>) : Array<number>{
    var res = Array<number>(x.length)
    var numerator=Array<number>(x.length)

    var substractor =new Array<Array<number>>(x.length)
    var denominator=0
    //better, use a cumulation :)
    // -----initialization
    for (let i = 0; i < x.length; i++) {
        substractor[i]=new Array<number>(x[i].length)
        for (let j = 0; j < x[i].length; j++) {
            numerator[i]+=x[i][j]*expMap[j]
            substractor[i][j]=x[i][j]*expMap[j]
        }    
    }

    for (let j = 0; j < x[0].length; j++) {
        denominator+=expMap[j]
    }


    // ---computing the gradient

    for (let j = 0; j < x[0].length; j++){
        for (let i = 0; i < x.length; i++) {
            
                res[i]+=x[i][j] - ((denominator == 0)?0:numerator[i]/denominator)
                numerator[i]-=substractor[i][j]
                

                
            
            }
            denominator-=expMap[j]
        
    }

    return res
}



export function coxDerivative(data:Mat): (beta:Array<number>)=> Array<number>{
    return function(beta :Array<number>){
        return derivative(data,expMap(data,beta))
    }

}


