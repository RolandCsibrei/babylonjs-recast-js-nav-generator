import { Leva } from "leva";
import { useGlbActionsControls } from "../leva-controls/glb-actions";
import {
  signalEditor,
  signalModelBlob,
  signalNavMeshParameters,
} from "../signals";
import { useNavMeshActionsControls } from "../leva-controls/navmesh-actions";
import { useSignals } from "@preact/signals-react/runtime";
import { useNavMeshGenerationControls } from "../leva-controls/navmesh-config";
import { useDebugDisplayOptionsControls } from "../leva-controls/debug-display-options";
import { useGlbDisplayOptionsControls } from "../leva-controls/glb-display-options";
import { useCliPlaneOptionsControls } from "../leva-controls/clipping-planes-options";
import { useTestAgentControls } from "../leva-controls/agent-display-options";
import { useDebugDrawerControls } from "../leva-controls/debug-draw-controls";
export function EditorPage() {
  useSignals();

  const generateNavMesh = () => {
    signalNavMeshParameters.value = { ...navMeshConfig };
  };

  const loadGlb = () => {
    document.getElementById("load-glb")?.click();
  };

  const loadDefault = () => {
    signalModelBlob.value = null;
  };

  const exportAsGlb = () => {
    signalEditor.peek()?.exportAsGlb();
  };

  const exportAsRecastNavMesh = () => {
    signalEditor.peek()?.exportAsRecastNavMesh();
  };

  // Leva controls
  useGlbActionsControls({
    loadGlb,
    loadDefault,
    exportAsGlb,
  });

  useNavMeshActionsControls({
    generateNavMesh,
    exportAsRecastNavMesh,
  });

  useGlbDisplayOptionsControls();
  useDebugDisplayOptionsControls();
  useDebugDrawerControls();
  const { navMeshConfig } = useNavMeshGenerationControls();
  useTestAgentControls();

  useCliPlaneOptionsControls();

  return (
    <Leva
      hidden={false}
      theme={{
        sizes: {
          rootWidth: "400px",
          controlWidth: "150px",
        },
      }}
    />
  );
}
