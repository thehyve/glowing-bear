export class BreakdownType {
  static readonly GENDER = new BreakdownType('gender', 'Gender')
  static readonly ETHNICITY = new BreakdownType('ethnicity', 'Ethnicity')
  static readonly AGEBIN = new BreakdownType('agebin', 'Age bin')
  static readonly AVAILABLE = [BreakdownType.GENDER,
  BreakdownType.ETHNICITY,
  BreakdownType.AGEBIN
  ]
  private constructor(public readonly id: string, public readonly name: string) { }
}
