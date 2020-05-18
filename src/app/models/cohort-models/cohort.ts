import { Constraint } from "../constraint-models/constraint"
import { subscribeOn } from "rxjs/operators"
import { runInThisContext } from "vm"

export class Cohort{
    _name :string
    _patient_set_id : Map<string,number>

    _selected : boolean


    _constraint : Constraint
    constructor(name :string, constraint : Constraint){
        this._name=name
        
        if (constraint !=null){
            var cpy= new Constraint()
            cpy.parentConstraint=constraint.parentConstraint
            cpy.textRepresentation=cpy.textRepresentation
    
            this._constraint=cpy
        }
        
        
        this._selected=false
    }

    get name() : string{
        return this._name
    }

    get patient_set_id():Map<string,number>{
        return new Map(this._patient_set_id)
    }

    get constraint(): Constraint{
        var cpy = new Constraint
        cpy.parentConstraint=this._constraint.parentConstraint
        cpy.textRepresentation=this._constraint.textRepresentation
        return cpy
        
    }

    set constraint(constr : Constraint){
        var cpy = new Constraint
        cpy.parentConstraint=this._constraint.parentConstraint
        cpy.textRepresentation=this._constraint.textRepresentation
        this._constraint=cpy

    }

    set name(n : string){
        this._name =n
    }

    set patient_set_id(psid : Map<string,number>){
        this._patient_set_id=new Map(psid)

    }

    set selected(select : boolean){
        this.selected=select
    }

    get selected() : boolean{
        return this.selected
    }

}


export class SurvivalCohort extends Cohort{

    _hasSubGroups:boolean
    _granularity: string

    _subGroups : Array<Cohort>
    constructor(name:string, constraint: Constraint){
        super(name,constraint)
        this._hasSubGroups=false

    }


    set hasSubGroups(val:boolean){
        this._hasSubGroups=val
    }

    get hasSubGroups() : boolean{
        return this._hasSubGroups
    }

    get subGroups(): Array<Cohort>{
        return this._subGroups.map(function(subGroup:Cohort){
            var cpy = new Cohort(subGroup.name, subGroup.constraint)
            return cpy
        })

    }

    set subGroups(subGroups: Array <Cohort>){
        this._subGroups= subGroups.map(function(subGroup:Cohort){
            var cpy = new Cohort(subGroup.name, subGroup.constraint)
            return cpy
        })
    }


}