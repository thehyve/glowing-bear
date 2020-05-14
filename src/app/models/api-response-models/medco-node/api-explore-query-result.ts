export class ApiExploreQueryResult {
  status: 'queued'|'pending'|'error'|'available';
  encryptedCount: string;
  encryptedPatientList: string[];
  patientSetId : number;
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
