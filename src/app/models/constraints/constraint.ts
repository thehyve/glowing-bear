export interface Constraint {

  // The textual representation of this contraint
  textRepresentation: string;
  // The flag indicating if the output query object should be wrapped with
  // the subselection clause for patient selection
  isPatientSelection: boolean;

  /**
   * Returns the name of the constraint class.
   */
  getClassName(): string;

  /**
   * Returns a javascript object representation of the constraint to be used
   * in queries to the backend.
   */
  toQueryObject(): Object;

  /**
   * Returns a javascript object representation of the constraint to be used for patients retrieval,
   * wrapped in subselction clause according to TranSMART api requirements
   * @returns {Object}
   */
  toPatientQueryObject(): Object;

}
