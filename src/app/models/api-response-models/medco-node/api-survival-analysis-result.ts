export class ApiSurvivalAnalysisResult{
    results : {
        groupId : string
        groupResults: {
            events :{
                censoringEvent : string
                eventOfInterest : string
            }
            timepoint : string
        }[]
    }[];
    
    timers: {
        name: string;
        milliseconds: number;
      }[];
}