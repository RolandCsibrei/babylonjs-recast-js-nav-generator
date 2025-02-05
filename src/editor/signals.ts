import { signal } from "@preact/signals-core";
import { NavMeshParameters } from "./plugin/RecastNavigationJSPlugin";
import { NavMesh } from "recast-navigation";
import { Nullable } from "@babylonjs/core/types";
import { EditorScene } from "../EditorScene";

const sigalnIsLoading = signal(false);

const signalEditor = signal<EditorScene>();
const signalModelBlob = signal<Blob | null>(null);
const signalIsInspectorOpen = signal(false);
const signalNavMeshParameters = signal<NavMeshParameters>();
const signalNavMesh = signal<Nullable<NavMesh>>(null);

const signalDisplayModel = signal(true);

const signGlbDisplayOptions = signal<{
  displayModel: boolean;
}>();

const signalDebugDisplayOptions = signal<{
  displayNavMeshGenerationInput: boolean;
  navMeshGeneratorInputWireframe: boolean;
  navMeshGeneratorInputOpacity: number;
  navMeshGeneratorInputDebugColor: string;
}>();

export {
  signalEditor,
  sigalnIsLoading,
  //
  signalModelBlob,
  signalIsInspectorOpen,
  signalNavMeshParameters,
  signalNavMesh,
  //
  signalDisplayModel,
  signalDebugDisplayOptions,
  signGlbDisplayOptions,
};
