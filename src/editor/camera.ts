import { CubicEase, EasingFunction } from "@babylonjs/core/Animations/easing";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { IVector3Like } from "@babylonjs/core/Maths/math.like";
import { Scene } from "@babylonjs/core/scene";
import { Animation } from "@babylonjs/core/Animations/animation";
import { Tools } from "@babylonjs/core/Misc/tools";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export interface CameraLimits {
  lowerAlpha?: number;
  upperAlpha?: number;
  lowerBeta?: number;
  upperBeta?: number;
  lowerRadiusLimit?: number;
  upperRadiusLimit?: number;
  minZ?: number;
  maxZ?: number;
  angularSensitivityX?: number;
  angularSensitivityY?: number;
  panningSensitivity?: number;
  pinchDeltaPercentage?: number;
  wheelDeltaPercentage?: number;
  speed?: number;
  useNaturalPinchZoom?: boolean;
  pinchPrecision?: number;
  panningInertia?: number;
  pinchToPanMaxDistance?: number;
  inertialRadiusOffset?: number;
  mapPanning?: boolean;
}

const SPEED_RATIO = 1;
const LOOP_MODE = false;
const FROM_FRAME = 0;
const TO_FRAME = 100;
const FRAMES_PER_SECOND = 60;

export enum ZoomType {
  Predefined = 0,
  Custom = 1,
  ZoomOn = 2,
}

export interface CameraValues {
  radius: number;
  alpha: number;
  beta: number;
  target: IVector3Like | AbstractMesh;
}

export function zoomOnScene(scene: Scene, camera: ArcRotateCamera) {
  camera.zoomOn(
    // TODO: refactor this
    scene.meshes.filter(
      (m) =>
        m.name !== "ground" &&
        m.name !== "clip-plane-1" &&
        m.name !== "clip-plane-2"
    )
  );
}

export function moveCamera(
  scene: Scene,
  camera: ArcRotateCamera,
  { radius, alpha, beta, target }: CameraValues
) {
  if ("x" in target) {
    camera.animations = [
      createAnimation({
        property: "radius",
        from: camera.radius,
        to: radius,
      }),
      createAnimation({
        property: "beta",
        from: simplifyRadians(camera.beta),
        to: beta,
      }),
      createAnimation({
        property: "alpha",
        from: simplifyRadians(camera.alpha),
        to: alpha,
      }),
      createAnimation({
        property: "target.x",
        from: camera.target.x,
        to: target.x,
      }),
      createAnimation({
        property: "target.y",
        from: camera.target.y,
        to: target.y,
      }),
      createAnimation({
        property: "target.z",
        from: camera.target.z,
        to: target.z,
      }),
    ];
  }

  scene.beginAnimation(camera, FROM_FRAME, TO_FRAME, LOOP_MODE, SPEED_RATIO);
}

function createAnimation({
  property,
  from,
  to,
}: {
  property: string;
  from: number;
  to: number;
}) {
  const ease = new CubicEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  const animation = Animation.CreateAnimation(
    property,
    Animation.ANIMATIONTYPE_FLOAT,
    FRAMES_PER_SECOND,
    ease
  );
  animation.setKeys([
    {
      frame: 0,
      value: from,
    },
    {
      frame: 100,
      value: to,
    },
  ]);

  return animation;
}

function simplifyRadians(radians: number) {
  const simplifiedRadians = radians % (2 * Math.PI);

  return simplifiedRadians < 0
    ? simplifiedRadians + Tools.ToRadians(360)
    : simplifiedRadians;
}

export function zoomToPosition(scene: Scene, zoomToPosition: IVector3Like) {
  moveCamera(scene, scene.activeCamera as ArcRotateCamera, {
    radius: 40,
    alpha: 1.4 + Math.PI,
    beta: 0.6,
    target: zoomToPosition,
  });
}

export function setCameraLimits(camera: ArcRotateCamera, limits: CameraLimits) {
  camera.pinchPrecision = limits.pinchPrecision ?? camera.pinchPrecision;
  camera.panningSensibility =
    limits.panningSensitivity ?? camera.panningSensibility;
  camera.pinchToPanMaxDistance =
    limits.pinchToPanMaxDistance ?? camera.pinchToPanMaxDistance;
  camera.inertialRadiusOffset =
    limits.inertialRadiusOffset ?? camera.inertialRadiusOffset;

  camera.lowerAlphaLimit = limits.lowerAlpha ?? camera.lowerAlphaLimit;
  camera.upperAlphaLimit = limits.upperAlpha ?? camera.upperAlphaLimit;
  camera.lowerBetaLimit = limits.lowerBeta ?? camera.lowerBetaLimit;
  camera.upperBetaLimit = limits.upperBeta ?? camera.upperBetaLimit;

  camera.lowerRadiusLimit = limits.lowerRadiusLimit ?? camera.lowerRadiusLimit;
  camera.upperRadiusLimit = limits.upperRadiusLimit ?? camera.upperRadiusLimit;

  camera.minZ = limits.minZ ?? camera.minZ;
  camera.maxZ = limits.maxZ ?? camera.maxZ;

  camera.angularSensibilityX =
    limits.angularSensitivityX ?? camera.angularSensibilityX;
  camera.angularSensibilityY =
    limits.angularSensitivityY ?? camera.angularSensibilityY;
  camera.pinchDeltaPercentage =
    limits.pinchDeltaPercentage ?? camera.pinchDeltaPercentage;
  camera.wheelDeltaPercentage =
    limits.wheelDeltaPercentage ?? camera.wheelDeltaPercentage;
  camera.speed = limits.speed ?? camera.speed;

  camera.panningInertia = limits.panningInertia ?? 0.85;

  camera.mapPanning = limits.mapPanning ?? camera.mapPanning;
}
