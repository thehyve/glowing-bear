# Glowing Bear MedCo
*glowing-bear-medco* is the web user interface of MedCo.
You can find more information about the MedCo project [here](https://medco.epfl.ch/).
For further details, support, and contacts, you can check the [MedCo Technical Documentation](https://ldsec.gitbook.io/medco-documentation/).

## Source code organization
- *deployment*: docker deployment files
- *src*: root of the source code
  - *app*: angular application
    - *config*: configuration of the application
    - *models*: models used in the application
    - *modules*: angular modules
      - *gb-explore-module*: explore query module, enabling the construction of an explore query
      - *gb-explore-results-module*: explore query results module, displaying the results of the explore queries
      - *gb-main-module*: angular main module
      - *gb-navbar-module*: navigation bar module, containing the menu with tabs
      - *gb-side-panel-module*: side panel module, containing the summary, ontology tree and saved cohorts
      - *gb-analysis-module*: analysis module, containing the analysis option (only survival at the current time) and settings for the analysis to run
      - *gb-survival-results-module*: survival results module, containing the results of the various operations run on survival data points in the context of survival analysis. An overview of this compenent's logic can be found in this [file](https://github.com/ldsec/glowing-bear-medco/src/survival-analysis.md).
    - *services*: services handling data flow
    - *utilities*: utility tools: crypto, log, error, etc.
  - *assets*: static assets 
  - *environments*: definition of production or test environment
  - *styles*: CSS styles

## Getting started
*glowing-bear-medco* needs a MedCo deployment to be used. A description of the available deployment profiles, along with a detailed guide on how to use them, is available 
[here](https://ldsec.gitbook.io/medco-documentation/system-administrator-guide/deployment).

### Use the live development server
```bash
cd deployment
docker-compose up dev-server
```

### Build the Docker image
```bash
cd deployment
docker-compose build glowing-bear-medco
```

### Generate the mapping table
The crypto utility has a point to integer mapping table present in the file `src/app/utilities/crypto/point-to-int-mapping.ts`.
In order to regenerate this file, e.g. so that it contains more points, you can run the following command:

```bash
cd deployment
USER_ID=$(id -u):$(id -g) docker-compose -f docker-compose.gen-mapping-table.yml run gen-mapping-table
```

Note that the maximum value present in this mapping table is the maximum number that the library will be able to decrypt.

## License
*glowing-bear-medco* is licensed under the MPL 2.0. If you need more information, please contact us.
