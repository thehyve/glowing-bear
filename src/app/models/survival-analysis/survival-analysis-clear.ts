export class SurvivalAnalysisClear{
    results : {
        groupId : string
        initialCount: number
        groupResults: {
            events :{
                censoringEvent : number
                eventOfInterest : number
            }
            timepoint : number
        }[]
    }[];
    
}