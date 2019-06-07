import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {TransmartCrossTableMapper} from './transmart-cross-table-mapper';
import {CrossTable} from '../../models/table-models/cross-table';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';

describe('TransmartCrossTableMapper', () => {

  it('should deserialise a Transmart cross table', () => {
    const valueTable = new TransmartCrossTable();
    valueTable.rows = [
      [1, 4],
      [2, 5],
      [3, 6]
    ];

    const crossTable = new CrossTable();
    const concept = new Concept();
    concept.label = 'A';
    const conceptConstraint = new ConceptConstraint();
    conceptConstraint.concept = concept;
    crossTable.rowConstraints = [new TrueConstraint(), conceptConstraint, conceptConstraint];
    const value1Constraint: ConceptConstraint = Object.assign(conceptConstraint);
    const value2Constraint: ConceptConstraint = Object.assign(conceptConstraint);
    const value3Constraint: ConceptConstraint = Object.assign(conceptConstraint);
    crossTable.rowHeaderConstraints = [
      [new TrueConstraint(), value1Constraint],
      [new TrueConstraint(), value2Constraint],
      [new TrueConstraint(), value3Constraint]];
    crossTable.columnConstraints = [new TrueConstraint()];
    crossTable.columnHeaderConstraints = [
      [new TrueConstraint(), new TrueConstraint()],
      [new StudyConstraint(), new StudyConstraint()]];

    const result = TransmartCrossTableMapper.mapTransmartCrossTable(valueTable, crossTable);
    const resultValues = result.rows.map(row => Object.keys(row.data).map(col => row.data[col].value));

    expect(resultValues.length).toBe(4);
    expect(resultValues[0].length).toBe(5);
    const numericValues = resultValues.slice(1, 4).map(row => row.slice(2, 4).map(cell => Number(cell)));
    expect(numericValues).toEqual(valueTable.rows);
  });

});
