import {Patient} from "./patient";

export class Workflow {
  private patients: Patient[];

  getPatients(): Patient[] {
    return this.patients;
  }

  setPatients(patients: Patient[]): void {
    this.patients = patients;
  }

}
