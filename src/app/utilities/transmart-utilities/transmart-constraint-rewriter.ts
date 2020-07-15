import {AbstractTransmartConstraintVisitor} from './abstract-transmart-constraint-visitor';
import {
  TransmartCombinationConstraint,
  TransmartConceptConstraint,
  TransmartConstraint, TransmartFieldConstraint, TransmartNegationConstraint, TransmartNullConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartStudyNameConstraint,
  TransmartSubSelectionConstraint,
  TransmartTemporalConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint,
  TransmartModifierConstraint
} from '../../models/transmart-models/transmart-constraint';

/**
 * Rewrites constraints to simplify them. The following rules are applied:
 * - eliminate double negation:
 *   <code>{type: 'negation', arg: {type: 'negation', arg: { type: 'study_name', studyId: 'A'}}}</code>
 *   is rewritten to: <code>{ type: 'study_name', studyId: 'A'}</code>
 * - flatten nested combination constraints (but keeping combination constraints with tree node data intact):
 *   <code>{type: 'and', args: [{type: 'concept'}, {type: 'and', args: [{type: 'value'}]}]}</code>
 *   is rewritten to: <code>{type: 'and', args: [{type: 'concept'}, {type: 'value'}]}</code>
 * - simplify singleton combination constraints:
 *   <code>{type: 'and', args: [{type: 'concept'}]}</code>
 *   is rewritten to: <code>{type: 'concept'}</code>
 * - simplify empty combination constraints:
 *   <code>{type: 'and', args: []}</code> is rewritten to: <code>{type: 'true'}</code>
 *   <code>{type: 'or', args: []}</code> is rewritten to: <code>{type: 'negation', arg: {type: 'true'}}</code>
 */
export class TransmartConstraintRewriter extends AbstractTransmartConstraintVisitor<TransmartConstraint> {

  flattenArguments(type: 'and'|'or', args: TransmartConstraint[]): TransmartConstraint[] {
    const newArgs: TransmartConstraint[] = [];
    args.forEach(arg => {
      if (arg.type === type && !arg['fullName']) {
        (<TransmartCombinationConstraint>arg).args.forEach(argChild => newArgs.push(argChild));
      } else {
        newArgs.push(arg);
      }
    });
    return newArgs;
  }

  visitCombinationConstraint(constraint: TransmartCombinationConstraint): TransmartConstraint {
    if (!['and', 'or'].includes(constraint.type)) {
      throw new Error(`Constraint type not supported: ${constraint.type}`);
    }
    const result = Object.assign({}, constraint);
    let args = result.args.map(arg => this.visit(arg));
    if (args.length === 0) {
      if (result.type === 'and') {
        return new TransmartTrueConstraint();
      } else if (result.type === 'or') {
        return new TransmartNegationConstraint(new TransmartTrueConstraint());
      }
    }
    if (constraint.type === 'and') {
      args = args.filter(arg => arg.type !== 'true');
    } else if (result.type === 'or') {
      if (args.some(arg => arg.type === 'true')) {
        return new TransmartTrueConstraint();
      }
    }
    if (args.length === 1) {
      return args[0];
    }
    args = this.flattenArguments(<'and'|'or'>constraint.type, args);

    result.args = args;
    return result;
  }

  visitConceptConstraint(constraint: TransmartConceptConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitFieldConstraint(constraint: TransmartFieldConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitNegationConstraint(constraint: TransmartNegationConstraint): TransmartConstraint {
    const result = Object.assign({}, constraint);
    result.arg = this.visit(result.arg);
    if (result.arg.type === 'negation') {
      return (<TransmartNegationConstraint>result.arg).arg;
    }
    return result;
  }

  visitNullConstraint(constraint: TransmartNullConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitPatientSetConstraint(constraint: TransmartPatientSetConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitRelationConstraint(constraint: TransmartRelationConstraint): TransmartConstraint {
    const result = Object.assign({}, constraint);
    result.relatedSubjectsConstraint = this.visit(result.relatedSubjectsConstraint);
    return result;
  }

  visitStudyNameConstraint(constraint: TransmartStudyNameConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitSubSelectionConstraint(constraint: TransmartSubSelectionConstraint): TransmartConstraint {
    const result = Object.assign({}, constraint);
    result.constraint = this.visit(result.constraint);
    return result;
  }

  visitTemporalConstraint(constraint: TransmartTemporalConstraint): TransmartConstraint {
    const result = Object.assign({}, constraint);
    result.eventConstraint = this.visit(result.eventConstraint);
    return result;
  }

  visitTimeConstraint(constraint: TransmartTimeConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitTrueConstraint(constraint: TransmartTrueConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitValueConstraint(constraint: TransmartValueConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

  visitModifierConstraint(constraint: TransmartModifierConstraint): TransmartConstraint {
    return Object.assign({}, constraint);
  }

}
