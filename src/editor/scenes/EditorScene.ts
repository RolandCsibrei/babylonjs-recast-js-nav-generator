import { exportNavMesh, init as initRecast } from "recast-navigation";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { ICrowd } from "@babylonjs/core/Navigation/INavigationEngine";
import { CreateCapsule } from "@babylonjs/core/Meshes/Builders/capsuleBuilder";
import { Nullable } from "@babylonjs/core/types";

import { AgentControls } from "../state/signals";

import { createFilesInput } from "../utils/scene-loader";

import { hookInspector } from "../utils/inspector";
import { setCameraLimits } from "../utils/camera";
import { download } from "../utils/download";
import { TAG_MODEL } from "../utils/tags";

import { NAV_MESH_DEBUG_NAME } from "../../plugin/RecastNavigationJSPluginDebug";
import { RecastNavigationJSPlugin } from "../../plugin/RecastNavigationJSPlugin";
import { subscribeModelBlob } from "./model-blob";
import { subscribeNavMeshParamaters } from "./nav-mesh-parameters";
import { subscribeIndexedTriangleInputMeshData } from "./indexed-triangle-input-mesh-data";
import { subscribeDisplayModel } from "./display-model";
import { subscribeDisplayOptions } from "./display-options";
import { subscribeDebugDrawerControls } from "./debug-drawer-controls";
import { subscribeClipPlanes } from "./clip-planes";
import {
  agentControlsToAgentParameters,
  subscribeTestAgent,
  updateCrowdAgentParams,
} from "./crowd-agent";

export const MAIN_LIGHT_NAME = "main-light";

export class EditorScene {
  public _engine: Engine;
  public _scene: Scene;
  public _camera: ArcRotateCamera;
  public _ui: AdvancedDynamicTexture;
  public _navigation?: RecastNavigationJSPlugin;

  public _debugNavMeshMaterial: StandardMaterial;
  public _navMeshGeneratorInputMeshMaterial: StandardMaterial;
  public _navMeshGeneratorInputMesh: Nullable<Mesh> = null;

  public _crowd?: ICrowd;
  public _agent?: {
    idx: number;
    transform: TransformNode;
    mesh: Mesh;
    target?: Mesh;
  };

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene, camera } = this._createScene(this._canvas);

    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

    this._engine = engine;
    this._scene = scene;
    this._camera = camera;
    this._ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");

    this._debugNavMeshMaterial = this._createDebugNavMeshMaterial();
    this._navMeshGeneratorInputMeshMaterial =
      this._createnavMeshGeneratorInputMeshMaterial();
  }

  public async init() {
    await this._initNavigation();

    this._subscribeSignals();

    this._runRenderLoop();

    this._scene.onReadyObservable.addOnce(async () => {
      // ready
    });
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

    const camera = new ArcRotateCamera("main", 0, 0, 100, Vector3.Zero());
    setCameraLimits(camera, {
      panningSensitivity: 15,
    });
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

  private _resetCamera() {
    this._camera.alpha = 0;
    this._camera.beta = 0;
    this._camera.radius = 100;
    this._camera.target = Vector3.ZeroReadOnly;
  }

  private _runRenderLoop() {
    this._scene.getEngine().runRenderLoop(() => {
      this._scene.render();
    });
  }

  public _createGround() {
    const groundMesh = CreateGround("ground", { width: 1000, height: 1000 });
    const groundMaterial = new GridMaterial("grid");
    groundMaterial.lineColor = new Color3(0.1, 0.1, 0.1);
    groundMaterial.mainColor = new Color3(0.25, 0.25, 0.25);
    groundMesh.material = groundMaterial;
    groundMaterial.backFaceCulling = false;
    groundMesh.position.y = -0.01;
    groundMesh.visibility = 0.8;
    return groundMesh;
  }

  private _createDebugNavMeshMaterial() {
    const material = new StandardMaterial("nav-mesh-debug");
    material.emissiveColor = Color3.Yellow();
    material.disableLighting = true;
    return material;
  }

  private _createnavMeshGeneratorInputMeshMaterial() {
    const material = new StandardMaterial("nav-mesh-input");
    material.disableLighting = true;
    return material;
  }

  public _removeExistingModels() {
    // const transformNodeIdstoDispose = this._scene.transformNodes.map(
    //   (n) => n.id
    // );
    // const meshNodeIdstoDispose = this._scene.meshes.map((n) => n.id);
    // this._diposeNodes([...transformNodeIdstoDispose, ...meshNodeIdstoDispose]);

    const meshNodeIdstoDispose = this._scene
      .getMeshesByTags(TAG_MODEL)
      .map((n) => n.id);
    this._diposeNodes([...meshNodeIdstoDispose]);
  }

  private _diposeNodes(ids: string[]) {
    for (const id of ids) {
      this._scene.getNodeById(id)?.dispose();
    }
  }

  private _subscribeSignals() {
    hookInspector(this._scene);

    this._createDragAndDropLoader();
    subscribeModelBlob(this);
    subscribeNavMeshParamaters(this);
    subscribeIndexedTriangleInputMeshData(this);
    subscribeDisplayModel(this);
    subscribeDisplayOptions(this);
    subscribeDebugDrawerControls();
    subscribeClipPlanes(this);
    subscribeTestAgent(this);
  }

  private _createDragAndDropLoader() {
    createFilesInput(this._engine, this._scene, this._canvas);
  }

  public createCrowdAndAgent(controls: AgentControls) {
    if (!this._navigation) {
      return;
    }

    if (this._agent) {
      updateCrowdAgentParams(this, controls);
      return;
    }

    const crowd = this._navigation.createCrowd(
      1,
      controls.agentRadius,
      this._scene
    );

    this._crowd = crowd;

    // const targetCube = CreateBox(
    //   "target-cube",
    //   { size: 0.1, height: 0.1 },
    //   this._scene
    // );

    // create agents
    const height = 2;
    const singleAgentMesh = CreateCapsule(
      "single-agent",
      { height, radius: 0.3 },
      this._scene
    );
    singleAgentMesh.position.y = height / 2;

    const matAgent = new StandardMaterial("agent", this._scene);

    // const variation = Math.random();
    // matAgent.diffuseColor = new Color3(
    //   0.4 + variation * 0.6,
    //   0.3,
    //   1.0 - variation * 0.3
    // );
    matAgent.diffuseColor = Color3.Red();
    singleAgentMesh.material = matAgent;

    const randomPos = this._navigation.getClosestPoint(new Vector3(-20, 0, 0));

    const transform = new TransformNode("agent-parent");
    singleAgentMesh.parent = transform;

    const agentIndex = crowd.addAgent(
      randomPos,
      agentControlsToAgentParameters(controls),
      transform
    );
    this._agent = {
      idx: agentIndex,
      transform: transform,
      mesh: singleAgentMesh,
      // target: targetCube,
    };
  }

  public getMeshesForNavMeshCreation() {
    return this._scene.meshes.filter(
      (m) => m.parent?.name === "__root__"
    ) as Mesh[];
  }

  public exportAsRecastNavMesh() {
    if (!this._navigation?.navMesh) {
      return;
    }
    const navMeshExport = exportNavMesh(this._navigation.navMesh);
    download(navMeshExport, "application/octet-stream", "navmesh.bin");
  }

  public async exportAsGlb() {
    const glb = await GLTF2Export.GLBAsync(this._scene, "navmesh.glb", {
      shouldExportNode: function (node) {
        return node.name === NAV_MESH_DEBUG_NAME;
      },
    });
    glb.downloadFiles();
  }
}
