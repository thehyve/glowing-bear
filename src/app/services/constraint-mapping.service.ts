import { Constraint } from '../models/constraint-models/constraint';
import { ApiI2b2Panel } from '../models/api-request-models/medco-node/api-i2b2-panel';
import { Injectable } from '@angular/core';
import { CombinationConstraint } from '../models/constraint-models/combination-constraint';
import { CombinationState } from '../models/constraint-models/combination-state';
import { ApiI2b2Item } from '../models/api-request-models/medco-node/api-i2b2-item';
import { ConceptConstraint } from '../models/constraint-models/concept-constraint';
import { GenomicAnnotationConstraint } from '../models/constraint-models/genomic-annotation-constraint';
import { ValueType } from '../models/constraint-models/value-type';
import { CryptoService } from './crypto.service';
import { ErrorHelper } from '../utilities/error-helper';
import { NegationConstraint } from '../models/constraint-models/negation-constraint';
import { ApiI2b2Timing } from 'app/models/api-request-models/medco-node/api-i2b2-timing';
import { ApiI2B2Modifier } from 'app/models/api-request-models/medco-node/api-i2b2-modifier';
import { NumericalOperator } from 'app/models/constraint-models/numerical-operator';
import { MessageHelper } from 'app/utilities/message-helper';
import { TextOperator } from 'app/models/constraint-models/text-operator';


@Injectable()
export class ConstraintMappingService {

  constructor(private cryptoService: CryptoService) { }

  public mapConstraint(constraint: Constraint): ApiI2b2Panel[] {
    let panels = [];
    this.mapCombinationConstraint(panels, constraint as CombinationConstraint, false);
    return panels;
  }

  private mapCombinationConstraint(panels: ApiI2b2Panel[], constraint: Constraint, negated: boolean) {
    switch (constraint.className) {
      case 'NegationConstraint':
        ((constraint as NegationConstraint).constraint as CombinationConstraint).children.forEach((childConstraint) =>
          this.mapCombinationConstraint(panels, childConstraint as CombinationConstraint, true));
        break;

      case 'CombinationConstraint':
        if ((constraint as CombinationConstraint).combinationState === CombinationState.Or) {
          panels.push(this.generateI2b2Panel(constraint, false));
        } else if ((constraint as CombinationConstraint).combinationState === CombinationState.And) {
          (constraint as CombinationConstraint).children.forEach((childConstraint) =>
            this.mapCombinationConstraint(panels, childConstraint as CombinationConstraint, negated))
        }
        break;

      default: // should be ConceptConstraint or GenomicAnnotationConstraint
        panels.push(this.generateI2b2Panel(constraint, negated));
        break;
    }
  }

  /**
   * Handles both cases where there is only one item in a panel (no intermediate CombinationConstraint), and
   * when there are more than one.
   *
   * @param constraint
   * @param negated
   */
  private generateI2b2Panel(constraint: Constraint, negated: boolean): ApiI2b2Panel {
    let panel = new ApiI2b2Panel();
    panel.panelTiming = constraint.panelTimingSameInstance ? ApiI2b2Timing.sameInstanceNum : ApiI2b2Timing.any
    panel.not = negated;

    switch (constraint.className) {
      case 'ConceptConstraint':
        panel.items.push(this.generateI2b2ItemFromConcept(constraint as ConceptConstraint));
        break;

      case 'GenomicAnnotationConstraint':
        panel.items.push(...this.generateI2b2ItemsFromGenomicAnnotation(constraint as GenomicAnnotationConstraint));
        break;

      case 'CombinationConstraint':
        let combConstraint = constraint as CombinationConstraint;
        if (combConstraint.combinationState !== CombinationState.Or) {
          throw ErrorHelper.handleNewError('combination state should be OR');
        }

        for (let i in combConstraint.children) {
          switch (combConstraint.children[i].className) {
            case 'ConceptConstraint':
              panel.items.push(this.generateI2b2ItemFromConcept(combConstraint.children[i] as ConceptConstraint));
              break;

            case 'GenomicAnnotationConstraint':
              panel.items.push(...this.generateI2b2ItemsFromGenomicAnnotation(combConstraint.children[i] as GenomicAnnotationConstraint));
              break;

            default:
              throw ErrorHelper.handleNewError(`unexpected constraint type (${combConstraint.children[i].className})`)
          }
        }
        break;

      default:
        throw ErrorHelper.handleNewError(`illegal constraint (${constraint.className})`);
    }

    console.log(`Generated i2b2 panel with ${panel.items.length} items`, panel);
    return panel;
  }

  private generateI2b2ItemFromConcept(constraint: ConceptConstraint): ApiI2b2Item {
    let item = new ApiI2b2Item();

    if (constraint.concept.encryptionDescriptor.encrypted) {
      // todo: children IDs implementation
      item.encrypted = true;
      item.queryTerm = this.cryptoService.encryptIntegerWithCothorityKey(constraint.concept.encryptionDescriptor.id);

    } else {
      item.encrypted = false;
      item.queryTerm = constraint.concept.path;
      if (constraint.concept.modifier) {
        item.modifier = new ApiI2B2Modifier()
        item.queryTerm = constraint.concept.modifier.appliedConceptPath;
        item.modifier.modifierKey = constraint.concept.modifier.path
        item.modifier.appliedPath = constraint.concept.modifier.appliedPath
      }

      switch (constraint.concept.type) {
      case ValueType.SIMPLE:
        break;

      case ValueType.NUMERICAL:
        item.type = 'NUMBER'
        if (constraint.applyNumericalOperator && (constraint.numericalOperator)) {
          item.operator = constraint.numericalOperator
          item.value = ''

          switch (constraint.numericalOperator) {
          case NumericalOperator.BETWEEN:
            if (!(constraint.minValue)) {
              throw ErrorHelper.handleNewError('Numerical operator BETWEEN defined, but no valid lower bound value provided.' +
                'The field was left empty or non numerical characters were used.');
            } else if (!(constraint.maxValue)) {
              throw ErrorHelper.handleNewError('numerical operator BETWEEN has been defined, but no valid lower bound value provided.' +
                'The field was left empty or non numerical characters were used.');
            } else if (constraint.maxValue < constraint.minValue) {
              throw ErrorHelper.handleNewError(`upper bound ${constraint.maxValue} lower than lower bound ${constraint.minValue}`);
            }

            item.value = constraint.minValue.toString() + ' and ' + constraint.maxValue.toString()
            break;

          case NumericalOperator.EQUAL:
          case NumericalOperator.GREATER:
          case NumericalOperator.GREATER_OR_EQUAL:
          case NumericalOperator.LOWER:
          case NumericalOperator.LOWER_OR_EQUAL:
          case NumericalOperator.NOT_EQUAL:
            if (!(constraint.numValue)) {
              throw ErrorHelper.handleNewError('A numerical operator has been defined, but no valid value provided.' +
                'The field was left empty or non numerical characters were used.');
            }

            item.value = constraint.numValue.toString();
            break;

          default:
            throw ErrorHelper.handleNewError(`Numerical operator: ${constraint.numericalOperator} not handled`);
          }
        }
        break;

      case ValueType.TEXT:
        item.type = 'TEXT'
        if (constraint.applyTextOperator && (constraint.textOperator)) {
          switch (constraint.textOperator) {
            case TextOperator.LIKE_EXACT:
            case TextOperator.LIKE_BEGIN:
            case TextOperator.LIKE_CONTAINS:
            case TextOperator.LIKE_END:
              item.operator = constraint.textOperator;
              item.value = constraint.textOperatorValue;
              break;

            case TextOperator.IN:
              item.operator = constraint.textOperator;
              item.value = constraint.textOperatorValue.split(',').map(substring => '\'' + substring + '\'').join(',');
              break;

            default:
              throw ErrorHelper.handleNewError(`Text operator: ${constraint.textOperator} not handled`);
          }
        }
        break;

      default:
        throw ErrorHelper.handleNewError(`Concept type not supported: ${constraint.concept.type.toString()}`);
      }
    }

    console.log(`Generated i2b2 item ${item.queryTerm}`, item)
    return item;
  }

  private generateI2b2ItemsFromGenomicAnnotation(constraint: GenomicAnnotationConstraint): ApiI2b2Item[] {
    return constraint.variantIds.map((variantId) => {
      let item = new ApiI2b2Item();
      item.encrypted = true;
      item.queryTerm = variantId; // todo: variant IDs are pre-encrypted
      return item;
    });
  }
}
