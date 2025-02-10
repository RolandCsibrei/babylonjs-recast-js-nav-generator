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
import { FilesInput } from "@babylonjs/core/Misc/filesInput";

import {
  AgentControls,
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signalNavMesh,
} from "../state/signals";

import { createFilesInput } from "../utils/scene-loader";

import { hookInspector } from "../utils/inspector";
import { setCameraLimits } from "../utils/camera";
import { download } from "../utils/download";
import { TAG_MODEL } from "../utils/tags";

import {
  NAV_MESH_DEBUG_NAME,
  RecastNavigationJSPluginDebug,
} from "../../plugin/RecastNavigationJSPluginDebug";
import { RecastNavigationJSPlugin } from "../../plugin/RecastNavigationJSPlugin";
import { subscribeModelBlob } from "./model-blob";
import { subscribeNavMeshParamaters } from "./nav-mesh-parameters";
import { subscribeIndexedTriangleInputMeshData } from "./indexed-triangle-input-mesh-data";
import { subscribeDisplayModel } from "./display-model";
import { subscribeDisplayOptions } from "./display-options";
import { subscribeDebugDrawerControls } from "./debug-drawer-controls";
import { unsubscribeClipPlanes } from "./clip-planes";
import {
  agentControlsToAgentParameters,
  subscribeTestAgent,
  updateCrowdAgentParams,
} from "./crowd-agent";
import { subscribeDisplayScenel } from "./display-scene";
import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { drawDebug } from "../../plugin/debug-drawer";

export const MAIN_LIGHT_NAME = "main-light";

export class EditorScene {
  public engine: Engine;
  public scene: Scene;
  public camera: ArcRotateCamera;
  public light: HemisphericLight;
  public ui: AdvancedDynamicTexture;
  public navigation?: RecastNavigationJSPlugin;
  public navigationDebug?: RecastNavigationJSPluginDebug;
  public root: Nullable<Mesh> = null;
  public filesInput: Nullable<FilesInput> = null;

  // public debugNavMeshMaterial: StandardMaterial;
  public navMeshGeneratorInputMeshMaterial: StandardMaterial;
  public navMeshGeneratorInputMesh: Nullable<Mesh> = null;
  public scaling = new Vector3(1, 1, 1); // calculated from the loaded model bounds, used to scale addiitonal controls on the scene

  public crowd?: ICrowd;
  public agent?: {
    idx: number;
    transform: TransformNode;
    mesh: Mesh;
    target?: Mesh;
  };

  constructor(private _canvas: HTMLCanvasElement) {
    const { engine, scene, camera, light } = this._createScene(this._canvas);

    if (!engine) {
      throw new Error("Unable to create babylon.js engine!");
    }

    if (!scene) {
      throw new Error("Unable to create babylon.js scene!");
    }

    scene.clearColor = new Color4(0.1, 0.1, 0.1, 1);

    this.engine = engine;
    this.scene = scene;
    this.camera = camera;
    this.light = light;
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("ui");

    // this.debugNavMeshMaterial = this._createDebugNavMeshMaterial();
    this.navMeshGeneratorInputMeshMaterial =
      this._createnavMeshGeneratorInputMeshMaterial();
  }

  public async init() {
    await this._initNavigation();

    this._subscribeSignals();

    this._runRenderLoop();

    this.scene.onReadyObservable.addOnce(async () => {
      // ready
    });
  }

  private async _initNavigation() {
    await initRecast();

    this.navigation = new RecastNavigationJSPlugin();
    this.navigationDebug = new RecastNavigationJSPluginDebug();
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
      minZ: 0.5,
      maxZ: 20000,
      lowerRadiusLimit: 0.5,
      upperRadiusLimit: 500,
    });
    camera.attachControl();

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return {
      camera,
      scene,
      engine,
      light,
    };
  }

  private _resetCamera() {
    this.camera.alpha = 0;
    this.camera.beta = 0;
    this.camera.radius = 100;
    this.camera.target = Vector3.ZeroReadOnly;
  }

  private _runRenderLoop() {
    this.scene.getEngine().runRenderLoop(() => {
      this.scene.render();
    });
  }

  public resetScene() {
    this.removeExistingModels();
    this._resetCamera();
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

  private _diposeNodes(ids: string[]) {
    for (const id of ids) {
      this.scene.getNodeById(id)?.dispose();
    }
  }

  private _subscribeSignals() {
    hookInspector(this.scene);

    this._createDragAndDropLoader();
    subscribeModelBlob(this);
    subscribeNavMeshParamaters(this);
    subscribeIndexedTriangleInputMeshData(this);
    subscribeDisplayModel(this);
    subscribeDisplayScenel(this);
    subscribeDisplayOptions(this);
    subscribeDebugDrawerControls(this);
    subscribeTestAgent(this);
  }

  private _createDragAndDropLoader() {
    this.filesInput = createFilesInput(this.engine, this.scene, this._canvas);
  }

  public drawDebug() {
    if (!this.navigationDebug) {
      return;
    }

    const navMesh = signalNavMesh.peek();
    if (!navMesh) {
      return;
    }

    const controls = signalDebugDrawerControls.peek();
    if (!controls) {
      return;
    }

    drawDebug(
      this.navigationDebug,
      navMesh,
      controls.navMeshDebugDrawOption,
      signalGeneratorIntermediates.peek(),
      this
    );
  }

  public removeExistingModels() {
    const meshNodeIdstoDispose = this.scene
      .getMeshesByTags(TAG_MODEL)
      .map((n) => n.id);
    this._diposeNodes([...meshNodeIdstoDispose]);
  }

  public recalcScalinfFromLoadedModel() {
    const rootBB = this.root?.getHierarchyBoundingVectors(true);
    if (rootBB) {
      const width = rootBB.max.x - rootBB.min.x;
      this.scaling.setAll(width / 2);
    }
  }

  public createAxisViewer() {
    return new AxesViewer(this.scene);
  }

  public createCrowdAndAgent(controls: AgentControls) {
    if (!this.navigation) {
      return;
    }

    if (this.agent) {
      updateCrowdAgentParams(this, controls);
      return;
    }

    const crowd = this.navigation.createCrowd(
      1,
      controls.agentRadius,
      this.scene
    );

    this.crowd = crowd;

    const height = 2;
    const singleAgentMesh = CreateCapsule(
      "single-agent",
      { height, radius: 0.3 },
      this.scene
    );
    singleAgentMesh.position.y = height / 2;

    const matAgent = new StandardMaterial("agent", this.scene);

    matAgent.diffuseColor = Color3.Red();
    singleAgentMesh.material = matAgent;

    const randomPos = this.navigation.getClosestPoint(new Vector3(0, 0, 0));

    const transform = new TransformNode("agent-parent");
    singleAgentMesh.parent = transform;

    const agentIndex = crowd.addAgent(
      randomPos,
      agentControlsToAgentParameters(controls),
      transform
    );
    this.agent = {
      idx: agentIndex,
      transform: transform,
      mesh: singleAgentMesh,
    };
  }

  public getMeshesForNavMeshCreation() {
    return this.scene.meshes.filter(
      (m) => m.parent?.name === "__root__"
    ) as Mesh[];
  }

  public exportAsRecastNavMesh() {
    if (!this.navigation?.navMesh) {
      return;
    }
    const navMeshExport = exportNavMesh(this.navigation.navMesh);
    download(navMeshExport, "application/octet-stream", "navmesh.bin");
  }

  public async exportAsGlb() {
    const glb = await GLTF2Export.GLBAsync(this.scene, "navmesh.glb", {
      shouldExportNode: function (node) {
        return node.name === NAV_MESH_DEBUG_NAME;
      },
    });
    glb.downloadFiles();
  }
}
