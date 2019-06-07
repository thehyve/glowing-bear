/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export enum Operator {
  lt = '<',
  gt = '>',
  eq = '=',
  neq = '!=',
  leq = '<=',
  geq = '>=',
  like = 'like',
  contains = 'contains',
  in = 'in',
  before = '<-',
  after = '->',
  between = '<-->',
  and = 'and',
  or = 'or',
  not = 'not',
  exists = 'exists',
  intersect = 'intersect',
  union = 'union',
  none = 'none'
}

export const OperatorValues = [
  Operator.lt,
  Operator.gt,
  Operator.eq,
  Operator.neq,
  Operator.leq,
  Operator.geq,
  Operator.like,
  Operator.contains,
  Operator.in,
  Operator.before,
  Operator.after,
  Operator.between,
  Operator.and,
  Operator.or,
  Operator.not,
  Operator.exists,
  Operator.intersect,
  Operator.union,
  Operator.none
];
