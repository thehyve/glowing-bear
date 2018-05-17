export interface Constraint {

  // The textual representation of this constraint
  textRepresentation: string;
  // The flag indicating if the output query object should be wrapped with
  // the subselection clause for patient selection
  isSubselection: boolean;
  // The parent constraint
  parent: Constraint;

  /**
   * Returns the name of the constraint class.
   */
  getClassName(): string;

  /**
   * Returns a javascript object representation of the constraint to be used
   * in queries to the backend.
   * The flag 'full' indicates if the to concept query object contains extra info,
   * which is used in saved queries
   */
  toQueryObject(full?: boolean): object;

  toQueryObjectWithSubselection(): object;

  toQueryObjectWithoutSubselection(): object;

}
