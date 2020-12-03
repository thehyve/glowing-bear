export class ExploreQueryType {
  static readonly PATIENT_LIST = new ExploreQueryType('patient_list', 70, 'Patient List');
  static readonly COUNT_PER_SITE = new ExploreQueryType('count_per_site', 60,  'Count per site');
  static readonly COUNT_PER_SITE_OBFUSCATED =
    new ExploreQueryType('count_per_site_obfuscated', 50, 'Count per site (obfuscated)');
  static readonly COUNT_PER_SITE_SHUFFLED =
    new ExploreQueryType('count_per_site_shuffled', 40, 'Count per site (shuffled)');
  static readonly COUNT_PER_SITE_SHUFFLED_OBFUSCATED =
    new ExploreQueryType('count_per_site_shuffled_obfuscated', 30, 'Count per site (shuffled & obfuscated)');
  static readonly COUNT_GLOBAL = new ExploreQueryType('count_global', 20, 'Global count');
  static readonly COUNT_GLOBAL_OBFUSCATED =
    new ExploreQueryType('count_global_obfuscated', 10, 'Global count (obfuscated)');

  static readonly ALL_TYPES = [
    ExploreQueryType.PATIENT_LIST,
    ExploreQueryType.COUNT_PER_SITE,
    ExploreQueryType.COUNT_PER_SITE_OBFUSCATED,
    ExploreQueryType.COUNT_PER_SITE_SHUFFLED,
    ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED,
    ExploreQueryType.COUNT_GLOBAL,
    ExploreQueryType.COUNT_GLOBAL_OBFUSCATED
  ];

  private constructor(public readonly id: string, public readonly weight: number, public readonly name: string) {}

  toString() {
    return this.id;
  }

  get hasPerSiteCounts(): boolean {
    return this.hasPatientLists ||
      this === ExploreQueryType.COUNT_PER_SITE ||
      this === ExploreQueryType.COUNT_PER_SITE_OBFUSCATED ||
      this === ExploreQueryType.COUNT_PER_SITE_SHUFFLED ||
      this === ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED;
  }

  get hasPatientLists(): boolean {
    return this === ExploreQueryType.PATIENT_LIST;
  }
}
