export class ApiExploreQueryResult {
  status: 'queued' | 'pending' | 'error' | 'available';
  encryptedCount: string;
  encryptedPatientList: string[];
  patientSetID: number;
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
