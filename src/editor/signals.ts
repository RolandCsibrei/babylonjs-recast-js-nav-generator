import { signal } from "@preact/signals-core";
import { NavMeshParameters } from "./plugin/RecastNavigationJSPlugin";

const signalModelBlob = signal<Blob | null>(null);
const signalIsInspectorOpen = signal(false);
const signalNavMeshParameters = signal<NavMeshParameters>();

export { signalModelBlob, signalIsInspectorOpen, signalNavMeshParameters };
