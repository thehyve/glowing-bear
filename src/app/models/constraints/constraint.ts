export interface Constraint {

  /**
   * Returns the name of the constraint class.
   */
  getClassName(): string;

  /**
   * Returns a javascript object representation of the constraint to be used
   * in queries to the backend.
   */
  toQueryObject(): Object;

  textRepresentation: string;

}
