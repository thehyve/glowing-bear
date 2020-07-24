import { ApiI2b2Panel } from "../medco-node/api-i2b2-panel"

export class ApiSurvivalAnalysis {
    ID : string
    patientGroupID:  number
    panels : Array<ApiI2b2Panel>
    timeLimit: number
    granularity: string
    startConceptCode: string
    endConceptString: string
    startColumn: string
    endColumn: string
    
}