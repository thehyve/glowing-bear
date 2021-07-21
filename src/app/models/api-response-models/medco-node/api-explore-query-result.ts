export class ApiExploreQueryResult {
  status: 'queued' | 'pending' | 'error' | 'available';
  encryptedCount: string;
  encryptedPatientList: string[];
  queryID: number;
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
