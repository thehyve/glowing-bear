import {Constraint} from '../models/constraint-models/constraint';
import {I2b2Panel} from '../models/api-request-models/medco-node/i2b2-panel';
import {Injectable} from "@angular/core";
import {CombinationConstraint} from "../models/constraint-models/combination-constraint";
import {CombinationState} from "../models/constraint-models/combination-state";
import {I2b2Item} from "../models/api-request-models/medco-node/i2b2-item";
import {ConceptConstraint} from "../models/constraint-models/concept-constraint";
import {GenomicAnnotationConstraint} from "../models/constraint-models/genomic-annotation-constraint";
import {ConceptType} from "../models/constraint-models/concept-type";
import {CryptoService} from "./crypto.service";

@Injectable()
export class ConstraintMappingService {

  constructor(private cryptoService: CryptoService) { }

  public mapConstraint(constraint: Constraint): I2b2Panel[] {
    if (constraint.className === 'TrueConstraint') {
      console.log('Empty constraint, generated empty panels');
      return [];

    } else if ( constraint.className === 'CombinationConstraint' &&
                (constraint as CombinationConstraint).combinationState === CombinationState.And) {
      let panels = [];
      this.mapCombinationConstraint(panels, constraint as CombinationConstraint);
      return panels;
    } else {
      throw new Error('illegal constraints provided')
    }
  }

  private mapCombinationConstraint(panels: I2b2Panel[], constraint: Constraint) {
    if (constraint.className !== 'CombinationConstraint' ||
      (constraint as CombinationConstraint).combinationState === CombinationState.Or) {
      panels.push(this.generateI2b2Panel(constraint));

    } else if ((constraint as CombinationConstraint).combinationState === CombinationState.And) {
      (constraint as CombinationConstraint).children.forEach((childConstraint) =>
        this.mapCombinationConstraint(panels, childConstraint as CombinationConstraint))

    }
  }

  /**
   * Handles both cases where there is only one item in a panel (no intermediate CombinationConstraint), and
   * when there are more than one.
   *
   * @param constraint
   */
  private generateI2b2Panel(constraint: Constraint): I2b2Panel {
    let panel = new I2b2Panel();
    panel.not = false; // todo: how to get the NOT?

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
          throw new Error("combination state should be OR");
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
              throw new Error(`unexpected constraint type (${combConstraint.children[i].className})`)
          }
        }
        break;

      default:
        throw new Error(`illegal constraint (${constraint.className})`);
    }

    console.log(`Generated panel: ${JSON.stringify(panel)}`);
    return panel;
  }

  private generateI2b2ItemFromConcept(constraint: ConceptConstraint): I2b2Item {
    let item = new I2b2Item();

    switch (constraint.concept.type) {
      // todo: missing types

      case ConceptType.SIMPLE:
        if (constraint.concept.encryptionDescriptor.encrypted) {
          // todo: children IDs implementation
          item.encrypted = true;
          item.operator = 'exists';
          item.queryTerm = this.cryptoService.encryptInteger(constraint.concept.encryptionDescriptor.id);

        } else {
          item.encrypted = false;
          item.operator = 'exists';
          item.queryTerm = constraint.concept.path;
        }
        break;

      default:
        throw new Error(`Concept type not supported: ${constraint.concept.type.toString()}`);
    }
    return item;
  }

  private generateI2b2ItemsFromGenomicAnnotation(constraint: GenomicAnnotationConstraint): I2b2Item[] {
    return constraint.variantIds.map((variantId) => {
      let item = new I2b2Item();
      item.encrypted = true;
      item.operator = 'exists';
      item.queryTerm = variantId; // todo: variant IDs are pre-encrypted
      return item;
    });
      }
}
