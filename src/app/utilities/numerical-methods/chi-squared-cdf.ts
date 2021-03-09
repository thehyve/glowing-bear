import * as jstat from 'jstat'

export function ChiSquaredCdf(value: number, degreesOfFreedom: number): number {
  return jstat.chisquare.cdf(value, degreesOfFreedom)
}
