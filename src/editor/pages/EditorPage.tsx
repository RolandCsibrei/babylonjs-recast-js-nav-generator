import { Leva } from "leva";
import { useGlbActionsControls } from "../leva-controls/glb-actions";
import {
  signalModelBlob,
  signalNavMesh,
  signalNavMeshParameters,
} from "../signals";
import { useNavMeshActionsControls } from "../leva-controls/navmesh-actions";
import { useSignals } from "@preact/signals-react/runtime";
import { useNavMeshGenerationControls } from "../leva-controls/navmesh-config";
export function EditorPage() {
  useSignals();

  const loading = false;

  const generateNavMesh = () => {
    console.log("Generate navmesh", navMeshConfig);
    signalNavMeshParameters.value = { ...navMeshConfig };
  };

  const loadGlb = () => {
    document.getElementById("load-glb")?.click();
  };

  const loadDefault = () => {
    signalModelBlob.value = null;
  };

  const exportAsGlb = () => {
    //
  };

  const exportAsRecastNavMesh = () => {
    //
  };

  // Leva controls
  useGlbActionsControls({
    loading,
    loadGlb,
    loadDefault,
    exportAsGlb,
    navMesh: signalNavMesh.value,
  });

  useNavMeshActionsControls({
    loading,
    generateNavMesh,
    exportAsRecastNavMesh,
    navMesh: signalNavMesh.value,
  });

  const { navMeshConfig } = useNavMeshGenerationControls();

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
