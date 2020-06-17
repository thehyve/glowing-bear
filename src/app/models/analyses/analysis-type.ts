
export class AnalysisType{
    _name: string
    _implemented:boolean
    
    private constructor(name:string,implemented:boolean ){
      this._name=name
      this._implemented=implemented
      
    }
    static readonly SURVIVAL= new AnalysisType("Survival",true)
    static readonly LINEAR_REGRESSION= new AnalysisType("Linear Regresion",false)
    static readonly LOGISTIC_REGRESSION= new AnalysisType("Logistic Regression",false)
  
    static readonly ALL_TYPES=[
      AnalysisType.SURVIVAL,
      AnalysisType.LINEAR_REGRESSION,
      AnalysisType.LOGISTIC_REGRESSION
    ]
  
    get name():string{
      return this._name
    }
    get implemented():boolean{
      return this._implemented
    }
  }