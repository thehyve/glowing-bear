export class QueryServiceMock {
  /*
    * ------ variables used in the Selection accordion in Data Selection ------
    */
  private _inclusionPatientCount = 0;
  private _exclusionPatientCount = 0;
  // the number of patients selected in the first step
  private _patientCount_1 = 0;
  // the number of observations from the selected patients in the first step
  private _observationCount_1 = 0;
  // the number of concepts from the selected patients in the first step
  private _conceptCount_1 = 0;
  // the number of studies from the selected patients in the first step
  private _studyCount_1 = 0;

  /*
   * ------ variables used in the Projection accordion in Data Selection ------
   */
  // the number of patients further refined in the second step
  // _patientCount_2 < or = _patientCount_1
  private _patientCount_2 = 0;
  // the number of observations further refined in the second step
  // _observationCount_2 < or = _observationCount_1
  private _observationCount_2 = 0;
  // the number of concepts further refined in the second step
  // _conceptCount_2 < or = _conceptCount_1
  private _conceptCount_2 = 0;
  // the number of studies further refined in the second step
  // _studyCount_2 < or = _studyCount_1
  private _studyCount_2 = 0;


  private _validTreeNodeTypes: string[] = [];

  private _isLoadingExportFormats = true;
  private _exportFormats = [];

  constructor() {
    this._validTreeNodeTypes = [
      'NUMERIC',
      'CATEGORICAL_OPTION',
      'STUDY',
      'UNKNOWN'
    ];
  }

  public updateCounts_1() {}
  public updateCounts_2() {}

  get isLoadingExportFormats(): boolean {
    return this._isLoadingExportFormats;
  }

  set isLoadingExportFormats(value: boolean) {
    this._isLoadingExportFormats = value;
  }

  get exportFormats(): Array<object> {
    return this._exportFormats;
  }

  set exportFormats(value: Array<object>) {
    this._exportFormats = value;
  }
}
