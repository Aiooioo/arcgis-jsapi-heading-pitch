define([
  "esri/chunks/vec3",
  "esri/chunks/vec3f64",
  "esri/chunks/vec4",
  "esri/chunks/vec4f64",
  "esri/chunks/mat4",
  "esri/chunks/mat4f64",
  "esri/core/Accessor",
  "esri/core/accessorSupport/trackingUtils",
  "esri/core/Evented",
  "esri/core/Logger",
  "esri/core/Handles",
  "esri/Graphic",
  "esri/geometry/SpatialReference",
  "esri/views/3d/externalRenderers",
], function (
  vec3,
  vec3f64,
  vec4,
  vec4f64,
  mat4,
  mat4f64,
  Accessor,
  trackingUtils,
  Evented,
  Logger,
  Handles,
  Graphic,
  SpatialReference,
  externalRenderers
) {
  var logger = Logger.getLogger(
    "geoscene.toolkit.math.AirplaneRendererViewModel"
  );

  function rad2deg(rad) {
    return (rad * 180) / Math.PI;
  }

  return Evented.EventedMixin(Accessor).createSubclass({
    declaredClass: "geoscene.toolkit.math.AirplaneRendererViewModel",

    properties: {
      observer: {},
      target: {},
      ready: {},
      view: {},
    },

    constructor() {
      this.logger = logger;
      this.supportedViewType = "3d";
      this.unsupportedErrorMessage =
        "AirplaneRendererViewModel is only supported in 3D views.";
      this.ready = false;
      this.view = null;
      this.handles = new Handles();
    },

    initialize() {
      this.handles.add([
        trackingUtils.autorun(() => {
          if (!!this.observer && !!this.target) {
            this.drawAirplane();
          }
        }),
      ]);
    },

    destroy() {},

    drawAirplane() {
      this.view.graphics.removeAll();

      const transformation = mat4f64.create();
      const geographicCoordinates = [
        this.observer.x,
        this.observer.y,
        this.observer.z,
        this.target.x,
        this.target.y,
        this.target.z,
      ];
      const renderCoordinates = new Array(6);
      externalRenderers.toRenderCoordinates(
        this.view,
        geographicCoordinates,
        0,
        SpatialReference.WebMercator,
        renderCoordinates,
        0,
        2
      );

      externalRenderers.renderCoordinateTransformAt(
        this.view,
        [this.observer.x, this.observer.y, this.observer.z],
        SpatialReference.WebMercator,
        transformation
      );
      mat4.invert(transformation, transformation);
      const targetVec4 = vec4f64.fromValues(
        renderCoordinates[3] - renderCoordinates[0],
        renderCoordinates[4] - renderCoordinates[1],
        renderCoordinates[5] - renderCoordinates[2],
        0
      );
      const targetLocalCoords = vec4f64.create();
      vec4.transformMat4(targetLocalCoords, targetVec4, transformation);
      const targetLocalCoordsVec3 = vec3f64.fromValues(
        targetLocalCoords[0],
        targetLocalCoords[1],
        targetLocalCoords[2]
      );
      vec3.normalize(targetLocalCoordsVec3, targetLocalCoordsVec3);
      const heading =
        Math.PI / 2 -
        Math.atan2(targetLocalCoordsVec3[1], targetLocalCoordsVec3[0]);

      this.view.graphics.add(
        new Graphic({
          geometry: this.observer,
          symbol: {
            type: "point-3d",
            symbolLayers: [
              {
                type: "object",
                width: 21.539997100830078 * 3,
                height: 7.0347914695739746 * 3,
                depth: 25.677627563476563 * 3,
                anchor: "origin",
                heading: (360 + rad2deg(heading)) % 360,
                tilt: 90 - rad2deg(Math.acos(targetLocalCoordsVec3[2])),
                resource: {
                  href: "https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/web/resource/Airplane_Large_Passenger.json",
                },
              },
            ],
          },
        })
      );
    },
  });
});
