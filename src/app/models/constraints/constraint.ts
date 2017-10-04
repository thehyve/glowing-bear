export interface Constraint {

  textRepresentation: string;

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
