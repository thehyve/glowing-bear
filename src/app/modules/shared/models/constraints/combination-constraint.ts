import {Constraint} from './constraint';
import {CombinationState} from "./combination-state";

export class CombinationConstraint implements Constraint {

  private _children: Constraint[];
  private _combinationState: CombinationState;


  constructor() {
    this._children = [];
    this.combinationState = CombinationState.And;
  }

  getClassName(): string {
    return 'CombinationConstraint';
  }

  hasNonEmptyChildren():boolean {
    return this.getNonEmptyQueryObjects().length > 0;
  }

  /**
   * Collects all non-empty query objects
   * @returns {Object[]}
   */
  getNonEmptyQueryObjects():Object[] {
    let childQueryObjects:Object[] =
      this._children.reduce((result:Object[], constraint:Constraint) => {
        let queryObject:Object = constraint.toQueryObject();
        if (queryObject && Object.keys(queryObject).length > 0) {
          result.push(queryObject);
        }
        return result;
      }, []);
    return childQueryObjects;
  }

  toQueryObject(): Object {
    // Collect children query objects
    let childQueryObjects:Object[] =  this.getNonEmptyQueryObjects();
    if (childQueryObjects.length == 0) {
      // No children, so ignore this constraint
      // TODO: show validation error instead?
      return null;
    }

    // Combination
    let queryObject:Object;
    if (childQueryObjects.length == 1) {
      // Only one child, so don't wrap it in and/or
      queryObject = {
        "type": "subselection",
        "dimension": "patient",
        "constraint": childQueryObjects[0]
      }
    }
    else {
      // Wrap the child query objects in subselections
      childQueryObjects = childQueryObjects.map(queryObject => {
        return {
          "type": "subselection",
          "dimension": "patient",
          "constraint": queryObject
        };
      });

      // Wrap in and/or constraint
      queryObject = {
        type: this._combinationState === CombinationState.And ? "and" : "or",
        args: childQueryObjects
      };
    }

    return queryObject;
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

  set children(value:Constraint[]) {
    this._children = value;
  }

  get combinationState(): CombinationState {
    return this._combinationState;
  }

  set combinationState(value: CombinationState) {
    this._combinationState = value;
  }

  switchCombinationState() {
    this.combinationState =
      (this.combinationState === CombinationState.And) ? CombinationState.Or : CombinationState.And;
  }

  removeChildConstraint(child:Constraint) {
    let index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

}
