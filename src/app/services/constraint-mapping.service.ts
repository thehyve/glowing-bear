import {Constraint} from '../models/constraint-models/constraint';
import {ApiI2b2Panel} from '../models/api-request-models/medco-node/api-i2b2-panel';
import {Injectable} from '@angular/core';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';
import {ApiI2b2Item} from '../models/api-request-models/medco-node/api-i2b2-item';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {GenomicAnnotationConstraint} from '../models/constraint-models/genomic-annotation-constraint';
import {ConceptType} from '../models/constraint-models/concept-type';
import {CryptoService} from './crypto.service';
import {ErrorHelper} from '../utilities/error-helper';
import {NegationConstraint} from '../models/constraint-models/negation-constraint';
import {ApiI2b2Timing} from 'app/models/api-request-models/medco-node/api-i2b2-timing';
import {ApiI2B2Modifier} from 'app/models/api-request-models/medco-node/api-i2b2-modifier';


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

    console.log(`Generated panel: ${JSON.stringify(panel)}`);
    return panel;
  }

  private generateI2b2ItemFromConcept(constraint: ConceptConstraint): ApiI2b2Item {
    let item = new ApiI2b2Item();




    switch (constraint.concept.type) {
      // todo: missing types

      case ConceptType.SIMPLE:
        if (constraint.concept.encryptionDescriptor.encrypted) {
          // todo: children IDs implementation
          item.encrypted = true;
          item.queryTerm = this.cryptoService.encryptIntegerWithCothorityKey(constraint.concept.encryptionDescriptor.id);

        } else {
          item.encrypted = false;
          item.queryTerm = constraint.concept.path;
          if (constraint.concept.modifier !== undefined) {
            item.modifier = new ApiI2B2Modifier()
            item.queryTerm = constraint.concept.modifier.appliedConceptPath;
            item.modifier.modifierKey = constraint.concept.modifier.path
            item.modifier.appliedPath = constraint.concept.modifier.appliedPath
          }

        }
        break;

      default:
        throw ErrorHelper.handleNewError(`Concept type not supported: ${constraint.concept.type.toString()}`);
    }
    console.log('from concept constraint ', constraint, ' path generated ', item.queryTerm)
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
