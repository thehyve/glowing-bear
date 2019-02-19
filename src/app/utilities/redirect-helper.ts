/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class RedirectHelper {

  public static redirectTo(target: string): void {
    console.log(`Redirecting to ${target} ...`);
    setTimeout(() => {
        // Redirect to login page
        window.location.assign(target);
      }, 2000
    );
  }

}
