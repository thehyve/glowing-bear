export class ApiExploreQueryResult {
  status: 'queued'|'pending'|'error'|'available';
  encryptedCount: string;
  encryptedPatientList: string[];
  resultInstanceID : number;
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
