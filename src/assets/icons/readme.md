
### Follow the steps to create customized icon fonts:

(source: [http://mediatemple.net/blog/tips/creating-implementing-icon-font-tutorial/](http://mediatemple.net/blog/tips/creating-implementing-icon-font-tutorial/))

#### Step 1: create or reuse SVG files

Use existing SVG sources or create our own, here we create our own SVG icons, PSD sources files are in the folder /psd. Note that for Photoshop to export correct SVG files, the geometrical objects should be saved as "shapes". A trick to make "shapes" from pixels is to make selection first, then convert the selection to paths, under the pen mode, find the Shape button on the top panel, click it to convert the paths to "shapes". Export the shapes as an SVG file. 

#### Step 2: create icon fonts

We then convert the exported SVG files to fonts, using [IcoMoon](https://icomoon.io/app/#/select). Import the SVG files to IcoMoon, click "Generate Font" and download the generated font-related file.

#### Step 3: Use the icon fonts to your own CSS file
Unzip the downloaded font-related file, copy the /fonts folder and the content in style.css to your own project. In our case, we copy the /fonts folder to ../glowing-bear/src/assets folder, and copy the content of style.css into ../glowing-bear/src/assets/icons.style.css.


The icon fonts used in this project are: 'folder-study' and 'folder-study-open' for study folders, 'icon-123' for numerical tree nodes, 'icon-abc' for nominal tree nodes and 'icon-hd' for high dimensional tree node.
