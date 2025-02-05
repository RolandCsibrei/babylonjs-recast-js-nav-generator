import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { signalModelBlob, signalNavMeshParameters } from "./editor/signals";
import { loadDefaultModel, loadModelFromBlob } from "./editor/scene-loader";

import { init as initRecast } from "recast-navigation";

import { RecastNavigationJSPlugin } from "./editor/plugin/RecastNavigationJSPlugin";
import { hookInspector } from "./editor/inspector";
import { zoomOnScene } from "./editor/camera";
import { StandardMaterial } from "@babylonjs/core";

export const MAIN_LIGHT_NAME = "main-light";

export class EditorScene {
  private _engine!: Engine;
  private _scene!: Scene;
  private _camera: ArcRotateCamera;
  private _ui!: AdvancedDynamicTexture;
  private _navigation!: RecastNavigationJSPlugin;

  private _debugNavMesh: Mesh;

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene, camera } = this._createScene(this._canvas);

    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    this._engine = engine;
    this._scene = scene;
    this._camera = camera;
    this._ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");
  }

  public async init() {
    await this._initNavigation();

    await loadDefaultModel();

    this._hookSignals();

    zoomOnScene(this.scene, this.camera);

    this._runRenderLoop();

    // debugger;
    this.scene.onReadyObservable.addOnce(async () => {
      // ready
    });
  }

  public get engine() {
    return this._engine;
  }

  public get scene() {
    return this._scene;
  }

  public get camera() {
    return this._camera;
  }

  public get ui() {
    return this._ui;
  }

  public get navigation() {
    return this._navigation;
  }

  private async _initNavigation() {
    await initRecast();

    this._navigation = new RecastNavigationJSPlugin();
  }

  private _createScene(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    const light = new HemisphericLight(
      MAIN_LIGHT_NAME,
      new Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.7;

    //

    const camera = new ArcRotateCamera("main", 0, 0, 50, Vector3.Zero());
    camera.attachControl();

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return {
      camera,
      scene,
      engine,
    };
  }

  private _runRenderLoop() {
    this.scene.getEngine().runRenderLoop(() => {
      this.scene.render();
    });
  }

  private _removeAllNodes() {
    const transformNodestoDispose = [...this.scene.transformNodes];
    transformNodestoDispose.forEach((n) => {
      n.dispose(false, true);
    });

    const meshesToDispose = [...this.scene.meshes];
    meshesToDispose.forEach((m) => {
      m.dispose(false, true);
    });
  }

  private _hookSignals() {
    hookInspector(this.scene);

    this._hookModelBlob();
    this._hookNavMeshParamaters();
  }

  private _hookNavMeshParamaters() {
    signalNavMeshParameters.subscribe(async (navMeshParams) => {
      if (!navMeshParams) {
        return;
      }

      const meshes = this.scene.meshes.filter(
        (m) => m.name !== "__root__"
      ) as Mesh[];
      this._navigation.createNavMesh(meshes, navMeshParams);

      if (this._debugNavMesh) {
        this._debugNavMesh.dispose();
      }
      this._debugNavMesh = this._navigation.createDebugNavMesh(this.scene);
      const material = new StandardMaterial("debug");
      this._debugNavMesh.material = material;
    });
  }

  private _hookModelBlob() {
    // TODO: unsubscribe
    signalModelBlob.subscribe(async (blob) => {
      if (blob) {
        this._removeAllNodes();
        await loadModelFromBlob(blob, "model.glb", this.scene);

        zoomOnScene(this.scene, this.camera);
      }
    });
  }
}
