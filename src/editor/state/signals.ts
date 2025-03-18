import { signal } from "@preact/signals-core";

import { NavMesh } from "recast-navigation";
import {
  SoloNavMeshGeneratorIntermediates,
  TileCacheGeneratorIntermediates,
  TiledNavMeshGeneratorIntermediates,
} from "recast-navigation/generators";

import { NavMeshParameters } from "../../plugin/RecastNavigationJSPlugin";
import { DebugDrawerOptions } from "../../plugin/debug-drawer";

import { EditorScene } from "../scenes/EditorScene";

export type AgentControls = {
  agentEnabled: boolean;
  agentRadius: number;
  agentHeight: number;
  agentMaxAcceleration: number;
  agentMaxSpeed: number;
};

export type GeneratorIntermediates =
  | SoloNavMeshGeneratorIntermediates
  | TiledNavMeshGeneratorIntermediates
  | TileCacheGeneratorIntermediates
  | null;

export enum DefaultGlbSize {
  Small = "s",
  Big = "b",
}

export type SignalSub = (() => void) | undefined;

type XYZ = { x: number; y: number; z: number };

const signalIsLoading = signal(false);
const signalIsInspectorOpen = signal(false);

const signalEditor = signal<EditorScene>();
const signalModelBlob = signal<Blob | null | DefaultGlbSize>(null);

const signalNavMeshParameters = signal<NavMeshParameters | null>(null);
const signalNavMesh = signal<NavMesh | null>(null);

const signalNavMeshOffset = signal<XYZ>({ x: 0, y: 0, z: 0 });

const signGlbDisplayOptions = signal<{
  displayModel: boolean;
}>();

const signalSceneDisplayOptions = signal<{
  displayGround: boolean;
  displayAxis: boolean;
}>();

const signalDebugDisplayOptions = signal<{
  displayNavMeshGenerationInput: boolean;
  navMeshGeneratorInputWireframe: boolean;
  navMeshGeneratorInputOpacity: number;
  navMeshGeneratorInputDebugColor: string;
}>();

const signalTestAgentControls = signal<AgentControls>();
const signalTestAgentStart = signal<XYZ>();
const signalTestAgentTarget = signal<XYZ>();

const signalClipPlanes = signal<
  Partial<{
    useClipPlanes: boolean;
  }>
>();

const signalDebugDrawerControls = signal<{
  navMeshDebugDraw: boolean;
  navMeshDebugDrawOption: DebugDrawerOptions;
}>();

const signalGeneratorIntermediates = signal<GeneratorIntermediates>(null);

const signalIndexedTriangleInputMeshData = signal<{
  positions: Float32Array | null;
  indices: Uint32Array | null;
} | null>(null);

const signalObstacleMode = signal(false);

export {
  signalEditor,
  signalIsLoading,
  signalIsInspectorOpen,
  //
  signalModelBlob,
  //
  signalNavMeshParameters,
  signalNavMesh,
  //
  signalTestAgentControls,
  signalTestAgentStart,
  signalTestAgentTarget,
  //
  signalSceneDisplayOptions,
  signalDebugDisplayOptions,
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signalIndexedTriangleInputMeshData,
  signGlbDisplayOptions,
  signalClipPlanes,
  //
  signalObstacleMode,
  //
  signalNavMeshOffset,
};
