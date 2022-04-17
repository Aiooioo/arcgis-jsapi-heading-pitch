# arcgis-jsapi-heading-pitch
Calculate the heading and pitch angle in ArcGIS API for JavaScript 3D.

1. Convert the input points from geo coordinate system to internal render coordinate system
2. Calculate affine transformation matrix from input geo coordinate system of the original point
3. Get the inversed affine transformation matrix
4. Apply the inversed matrix to the direction of internal render coordinate system
5. Normalize the final direction vector
6. Get heading and pitch from direction
