import {Constraint} from './constraint';
import {CombinationState} from './combination-state';
import {TrueConstraint} from './true-constraint';

export class CombinationConstraint implements Constraint {

  private _parent: Constraint;
  private _children: Constraint[];
  private _combinationState: CombinationState;
  private _isPatientSelection: boolean;
  private _isRoot: boolean;

  constructor() {
    this._children = [];
    this.combinationState = CombinationState.And;
    this.isRoot = false;
    this.parent = null;
  }

  getClassName(): string {
    return 'CombinationConstraint';
  }

  hasNonEmptyChildren(): boolean {
    return this.getNonEmptyChildObjects().length > 0;
  }

  addChild(constraint: Constraint) {
    if (!(constraint.getClassName() === 'CombinationConstraint'
        && (<CombinationConstraint>constraint).isRoot)) {
      constraint.parent = this;
    }
    this.children.push(constraint);
  }

  /**
   * Collects all non-empty query objects
   * @returns {Object[]}
   */
  getNonEmptyChildObjects(): Object[] {
    let childQueryObjects: Object[] =
      this._children.reduce((result: Object[], constraint: Constraint) => {
        let queryObject: Object = constraint.toQueryObject();
        if (queryObject && Object.keys(queryObject).length > 0) {
          result.push(queryObject);
        }
        return result;
      }, []);
    return childQueryObjects;
  }

  /**
   * This method is used to unwrap nested combination constraint
   * with single child
   * @param {Object} queryObject
   * @returns {Object}
   */
  unWrapNestedQueryObject(queryObject: object): object {
    const type = queryObject['type'];
    // If the query object is a combination constraint
    if (type === 'and' || type === 'or') {
      if (queryObject['args'].length === 1) {
        return this.unWrapNestedQueryObject(queryObject['args'][0]);
      } else {
        return queryObject;
      }
    } else {
      return queryObject;
    }
  }

  /**
   * Wrap a given query object with subselection clause
   * @param {Object} queryObject
   * @returns {Object}
   */
  wrapWithSubselection(queryObject: object): object {
    let queryObj = this.unWrapNestedQueryObject(queryObject);
    if (queryObj['type'] !== 'negation') {
      return {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': queryObj
      };
    } else {
      const arg = queryObj['arg'];
      const sub = {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': arg
      };
      return {
        'type': 'negation',
        'arg': sub
      };
    }
  }

  /**
   * This method is for querying patients,
   * which requires a speicial subselection wrapper
   * @returns {Object}
   */
  toPatientQueryObject(): Object {
    // Collect children query objects
    let childQueryObjects: Object[] = this.getNonEmptyChildObjects();
    if (childQueryObjects.length === 0) {
      // No children, so ignore this constraint
      // TODO: show validation error instead?
      return new TrueConstraint().toPatientQueryObject();
    }

    // Combination
    let queryObject: Object;
    if (childQueryObjects.length === 1) {
      // Only one child, so don't wrap it in and/or
      queryObject = this.wrapWithSubselection(childQueryObjects[0]);
    } else {
      // Wrap the child query objects in subselections
      childQueryObjects = childQueryObjects.map(queryObj => {
        return this.wrapWithSubselection(queryObj);
      });

      // Wrap in and/or constraint
      queryObject = {
        type: this._combinationState === CombinationState.And ? 'and' : 'or',
        args: childQueryObjects
      };
    }

    return queryObject;
  }

  /**
   * The normal conversion from constraint to object
   * TODO: optimize a nested combination constraint, detect empty or single child
   * @returns {Object}
   */
  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      // Collect children query objects
      let childQueryObjects: Object[] = this.getNonEmptyChildObjects();
      if (childQueryObjects.length === 0) {
        // No children, so ignore this constraint
        // TODO: show validation error instead?
        return new TrueConstraint().toQueryObject();
      }
      // Combination
      let queryObject: Object;
      if (childQueryObjects.length === 1) {
        queryObject = childQueryObjects[0];
      } else {
        // Wrap in and/or constraint
        queryObject = {
          type: this._combinationState === CombinationState.And ? 'and' : 'or',
          args: childQueryObjects
        };
      }
      return queryObject;
    }
  }

  get textRepresentation(): string {
    return 'Group';
  }

  isAnd() {
    return this.combinationState === CombinationState.And;
  }

  get children(): Constraint[] {
    return this._children;
  }

  set children(value: Constraint[]) {
    this._children = value;
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
  }

  switchCombinationState() {
    this.combinationState = (this.combinationState === CombinationState.And) ?
      CombinationState.Or : CombinationState.And;
  }

  removeChildConstraint(child: Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  get isPatientSelection(): boolean {
    return this._isPatientSelection;
  }

  set isPatientSelection(value: boolean) {
    this._isPatientSelection = value;
  }

  get isRoot(): boolean {
    return this._isRoot;
  }

  set isRoot(value: boolean) {
    this._isRoot = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }
}
