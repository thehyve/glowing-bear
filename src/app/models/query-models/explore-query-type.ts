export class ExploreQueryType {
  static readonly PATIENT_LIST = new ExploreQueryType("patient_list", "Patient List");
  static readonly COUNT_PER_SITE = new ExploreQueryType("count_per_site", "Count per site");
  static readonly COUNT_PER_SITE_OBFUSCATED =
    new ExploreQueryType("count_per_site_obfuscated", "Count per site (obfuscated)");
  static readonly COUNT_PER_SITE_SHUFFLED =
    new ExploreQueryType("count_per_site_shuffled", "Count per site (shuffled)");
  static readonly COUNT_PER_SITE_SHUFFLED_OBFUSCATED =
    new ExploreQueryType("count_per_site_shuffled_obfuscated", "Count per site (shuffled & obfuscated)");
  static readonly COUNT_GLOBAL = new ExploreQueryType("count_global", "Global count");
  static readonly COUNT_GLOBAL_OBFUSCATED =
    new ExploreQueryType("count_global_obfuscated", "Global count (obfuscated)");

  static readonly ALL_TYPES = [
    ExploreQueryType.PATIENT_LIST,
    ExploreQueryType.COUNT_PER_SITE,
    ExploreQueryType.COUNT_PER_SITE_OBFUSCATED,
    ExploreQueryType.COUNT_PER_SITE_SHUFFLED,
    ExploreQueryType.COUNT_PER_SITE_SHUFFLED_OBFUSCATED,
    ExploreQueryType.COUNT_GLOBAL,
    ExploreQueryType.COUNT_GLOBAL_OBFUSCATED
  ];

  private constructor(public readonly id: string, public readonly name: string) {}

  toString() {
    return this.id;
  }
}
