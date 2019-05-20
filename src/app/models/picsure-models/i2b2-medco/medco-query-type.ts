export class MedcoQueryType {
  static readonly PATIENT_LIST = new MedcoQueryType("patient_list", "Patient List");
  static readonly COUNT_PER_SITE = new MedcoQueryType("count_per_site", "Count per site");
  static readonly COUNT_PER_SITE_OBFUSCATED =
    new MedcoQueryType("count_per_site_obfuscated", "Count per site (obfuscated)");
  static readonly COUNT_PER_SITE_SHUFFLED =
    new MedcoQueryType("count_per_site_shuffled", "Count per site (shuffled)");
  static readonly COUNT_PER_SITE_SHUFFLED_OBFUSCATED =
    new MedcoQueryType("count_per_site_shuffled_obfuscated", "Count per site (shuffled & obfuscated)");
  static readonly COUNT_GLOBAL = new MedcoQueryType("count_global", "Global count");
  static readonly COUNT_GLOBAL_OBFUSCATED =
    new MedcoQueryType("count_global_obfuscated", "Global count (obfuscated)");

  private constructor(public readonly id: string, public readonly name: string) {}

  toString() {
    return this.id;
  }
}
