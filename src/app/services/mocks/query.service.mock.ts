export class QueryServiceMock {
  /*
    * ------ variables used in the Selection accordion in Data Selection ------
    */
  private _inclusionSubjectCount = 0;
  private _exclusionSubjectCount = 0;
  // the number of subjects selected in the first step
  private _subjectCount_1 = 0;
  // the number of observations from the selected subjects in the first step
  private _observationCount_1 = 0;
  // the number of concepts from the selected subjects in the first step
  private _conceptCount_1 = 0;
  // the number of studies from the selected subjects in the first step
  private _studyCount_1 = 0;

  /*
   * ------ variables used in the Projection accordion in Data Selection ------
   */
  // the number of subjects further refined in the second step
  // _subjectCount_2 < or = _subjectCount_1
  private _subjectCount_2 = 0;
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
