class ConstraintStorage{
  private _rootInclusionConstraint: CombinationConstraint;
  private _rootExclusionConstraint: CombinationConstraint;

  /*
   * List keeping track of all available constraints.
   * By default, the empty, constraints are in here.
   * In addition, (partially) filled constraints are added.
   * The constraints should be copied when editing them.
   */
  private _allConstraints: Constraint[] = [];
  private _concepts: Concept[] = [];
  private _conceptLabels: string[] = [];
  private _conceptConstraints: Constraint[] = [];
  private _genomicAnnotations: GenomicAnnotation[] = [];

  /*
   * The maximum number of search results allowed when searching for a constraint
   */
  private _maxNumSearchResults = 100;

  private constructor(
    rootInclusionConstraint : CombinationConstraint,
    rootExclusionConstraint :CombinationConstraint,
    allConstraints : Constraint[],
    concepts : Concept[],
    conceptLabels:string[],
    conceptConstraints:Constraint[],
    genomicAnnotations :GenomicAnnotation[]
    ){
      this._allConstraints=allConstraints.map(constraint => constraint.clone())
      this._conceptLabels=conceptLabels.map(x=>x)
      
    }
}