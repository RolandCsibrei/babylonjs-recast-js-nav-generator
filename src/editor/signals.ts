import { signal } from "@preact/signals-core";
import { NavMeshParameters } from "./plugin/RecastNavigationJSPlugin";
import { NavMesh } from "recast-navigation";
import { Nullable } from "@babylonjs/core/types";

const signalModelBlob = signal<Blob | null>(null);
const signalIsInspectorOpen = signal(false);
const signalNavMeshParameters = signal<NavMeshParameters>();
const signalNavMesh = signal<Nullable<NavMesh>>(null);

export {
  signalModelBlob,
  signalIsInspectorOpen,
  signalNavMeshParameters,
  signalNavMesh,
};
