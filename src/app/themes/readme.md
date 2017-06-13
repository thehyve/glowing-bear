The file "_custom.scss" is ony used for recompiling the customized css file of Bootstrap4 - bootstrap.css. To create it, follow the steps:


  1. go to [https://v4-alpha.getbootstrap.com/getting-started/download/](https://v4-alpha.getbootstrap.com/getting-started/download/), download bootstrap 4 source code, unzip;
  2. follow the instructions here: [https://v4-alpha.getbootstrap.com/getting-started/build-tools/#tooling-setup](https://v4-alpha.getbootstrap.com/getting-started/build-tools/#tooling-setup) to set up the building tools for compiling bootstrap code
  3. follow the instructions here: [https://v4-alpha.getbootstrap.com/getting-started/options/](https://v4-alpha.getbootstrap.com/getting-started/options/) to customize the variables
  4. run `$ grunt dist` to compile the customized bootstrap
  5. copy and paste customized bootstrap.css (or bootstrap.min.css) to the themes folder
 