export class MedcoNodeResult {
  // fields from API response
  nodeName?: string; // todo: make required (implement)
  networkName?: string; // todo: make required (implement)
  encryptedCount: string;
  encryptionKey: string;
  timeMeasurements?: object; // todo
  patientList?: object; // todo

  // fields of extracted data
  decryptedCount?: number;
}
