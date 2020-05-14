export class SurvivalAnalysisClear{
    results : {
        groupId : string
        groupResults: {
            events :{
                censoringEvent : number
                eventOfInterest : number
            }
            timepoint : number
        }[]
    }[];
    
}