import { signal } from "@preact/signals-core";
import { NavMeshParameters } from "../plugin/RecastNavigationJSPlugin";
import { NavMesh } from "recast-navigation";
import { Nullable } from "@babylonjs/core/types";
import { EditorScene } from "../EditorScene";
import {
  SoloNavMeshGeneratorIntermediates,
  TileCacheGeneratorIntermediates,
  TiledNavMeshGeneratorIntermediates,
} from "recast-navigation/generators";
import { DebugDrawerOptions } from "./leva-controls/debug-drawer";

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

type XYZ = { x: number; y: number; z: number };

export enum DefaultGlbSize {
  Small = "s",
  Big = "b",
}

const sigalnIsLoading = signal(false);

const signalEditor = signal<EditorScene>();
const signalModelBlob = signal<Blob | null | DefaultGlbSize>(null);
const signalIsInspectorOpen = signal(false);
const signalNavMeshParameters = signal<NavMeshParameters>();
const signalNavMesh = signal<Nullable<NavMesh>>(null);

const signalDisplayModel = signal(true);

const signGlbDisplayOptions = signal<{
  displayModel: boolean;
  displayGround: boolean;
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

const signalClippingPlanes = signal<
  Partial<{
    useClipPlane1: boolean;
    useClipPlane2: boolean;
  }>
>();

const signalDebugDrawerControls = signal<{
  navMeshDebugDraw: boolean;
  navMeshDebugDrawOption: DebugDrawerOptions;
}>();

const signalGeneratorIntermediates = signal<GeneratorIntermediates>(null);

export {
  signalEditor,
  sigalnIsLoading,
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
  signalDisplayModel,
  signalDebugDisplayOptions,
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signGlbDisplayOptions,
  signalClippingPlanes,
};
