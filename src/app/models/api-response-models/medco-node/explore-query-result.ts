export class ExploreQueryResult {
  status: string;
  encryptedCount: string;
  encryptedPatientList: string[];
  timers: {
    name: string;
    milliseconds: number;
  }[];
}
