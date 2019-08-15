import {MedcoQueryType} from "./medco-query-type";

export class MedcoNodeResult {
  // fields from API response
  nodeName?: string; // todo: make required (implement)
  networkName?: string; // todo: make required (implement)
  queryType: string;
  encryptedCount: string;
  encryptionKey: string;
  timeMeasurements?: object; // todo
  encryptedPatientList: string[];

  // fields of extracted data
  decryptedCount?: number;
  decryptedPatientList?: number[];
  parsedQueryType: MedcoQueryType;
}
