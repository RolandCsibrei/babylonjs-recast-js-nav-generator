import { useSignals } from "@preact/signals-react/runtime";

import { Leva } from "leva";
import { useGlbControls } from "../leva-controls/glb-controls";
import { useNavMeshControls } from "../leva-controls/nav-mesh-controls";
import { useNavMeshGenerationParametersControls } from "../leva-controls/nav-mesh-generation-parameters-controls";
import { useDebugDisplayControls } from "../leva-controls/debug-display-controls";
import { useGlbDisplayControls } from "../leva-controls/glb-display-controls";
import { useClipPlaneControls } from "../leva-controls/clip-planes-controls";
import { useTestAgentControls } from "../leva-controls/test-agent-controls";
import { useDebugDrawerControls } from "../leva-controls/debug-drawer-controls";
import { useSceneDisplayControls } from "../leva-controls/scene-display-controls";

import {
  DefaultGlbSize,
  signalEditor,
  signalModelBlob,
  signalNavMeshParameters,
} from "../state/signals";

import FileLoader from "../components/FileLoader";
// import { useObstaclesControls } from "../leva-controls/obstacles-controls";

export function EditorPage() {
  useSignals();

  const generateNavMesh = () => {
    // trigger navmesh generation
    signalNavMeshParameters.value = { ...navMeshConfig };
  };

  const loadGlb = () => {
    document.getElementById("load-glb")?.click();
  };

  const loadDefaultGlbSmall = () => {
    signalModelBlob.value = DefaultGlbSize.Small;
  };

  const loadDefaultGlbBig = () => {
    signalModelBlob.value = DefaultGlbSize.Big;
  };

  const exportAsGlb = () => {
    signalEditor.peek()?.exportAsGlb();
  };

  const exportAsRecastNavMesh = () => {
    signalEditor.peek()?.exportAsRecastNavMesh();
  };

  // Leva controls
  useGlbControls({
    loadGlb,
    loadDefaultGlbSmall,
    loadDefaultGlbBig,
    exportAsGlb,
  });

  useNavMeshControls({
    generateNavMesh,
    exportAsRecastNavMesh,
  });

  // useObstaclesControls();

  useGlbDisplayControls();
  useSceneDisplayControls();
  useDebugDisplayControls();
  useDebugDrawerControls();
  const { navMeshConfig } = useNavMeshGenerationParametersControls();
  useTestAgentControls();

  useClipPlaneControls();

  return (
    <>
      <FileLoader />

      <Leva
        hidden={false}
        theme={{
          sizes: {
            rootWidth: "400px",
            controlWidth: "150px",
          },
        }}
      />
    </>
  );
}
