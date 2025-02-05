import { signal } from "@preact/signals-core";
import { NavMeshParameters } from "./plugin/RecastNavigationJSPlugin";
import { NavMesh } from "recast-navigation";
import { Nullable } from "@babylonjs/core/types";
import { EditorScene } from "../EditorScene";

const signalEditor = signal<EditorScene>();
const signalModelBlob = signal<Blob | null>(null);
const signalIsInspectorOpen = signal(false);
const signalNavMeshParameters = signal<NavMeshParameters>();
const signalNavMesh = signal<Nullable<NavMesh>>(null);

export {
  signalEditor,
  //
  signalModelBlob,
  signalIsInspectorOpen,
  signalNavMeshParameters,
  signalNavMesh,
};
