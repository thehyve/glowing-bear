export class ApiExploreQueryResult {
  status: 'queued'|'pending'|'error'|'available';
  encryptedCount: string;
  encryptedPatientList: string[];
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
