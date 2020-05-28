
export class AnalysisType{
    _name: string
    
    private constructor(name:string ){
      this._name=name
      
    }
    static readonly SURVIVAL= new AnalysisType("Survival")
    static readonly LINEAR_REGRESSION= new AnalysisType("Linear Regresion")
    static readonly LOGISTIC_REGRESSION= new AnalysisType("Logistic Regression")
  
    static readonly ALL_TYPES=[
      AnalysisType.SURVIVAL,
      AnalysisType.LINEAR_REGRESSION,
      AnalysisType.LOGISTIC_REGRESSION
    ]
  
    get name():string{
      return this._name
    }
  }