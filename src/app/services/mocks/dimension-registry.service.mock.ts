import {SavedSet} from '../../models/saved-set';

export class DimensionRegistryServiceMock {
  private patientSets: SavedSet[] = [];
  constructor() {}

  getPatientSets() {
    return this.patientSets;
  }
}
