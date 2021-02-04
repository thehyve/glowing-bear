/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


 /**
  * Takes a concept path and a modifier path  and returns the corresponding URI that
  * services uses to identified the concept with applied modifier.
  *
  * @param unmodifiedConceptPath
  * @param modifierPath
  */
export function modifiedConceptPath(unmodifiedConceptPath: string, modifierPath: string): string {
  let modifierPathSplit = (modifierPath.length > 0 && modifierPath.startsWith('/')) ?
    modifierPath.substring(1).split('/') :
    modifierPath.split('/')
  modifierPathSplit.shift()
  let modifierPathWithoutTableAccess = modifierPathSplit.join('/')
  return `${unmodifiedConceptPath}${modifierPathWithoutTableAccess}`
}
