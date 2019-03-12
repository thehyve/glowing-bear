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
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';

export class TransmartConstraintRewriter extends AbstractTransmartConstraintVisitor<TransmartConstraint> {

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

}
