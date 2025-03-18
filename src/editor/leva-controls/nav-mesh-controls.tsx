import { button, useControls } from "leva";
import { useSignals } from "@preact/signals-react/runtime";

import {
  signalIsLoading,
  signalModelBlob,
  signalNavMesh,
  signalNavMeshOffset,
} from "../state/signals";

export const useNavMeshControls = ({
  generateNavMesh,
  exportAsRecastNavMesh,
}: {
  generateNavMesh: () => void;
  exportAsRecastNavMesh: () => void;
}) => {
  useSignals();

  useControls(
    "NavMesh Actions",
    {
      "Generate NavMesh": button(() => generateNavMesh(), {
        disabled: signalIsLoading.value || !signalModelBlob.value,
      }),
      "Export as Recast NavMesh": button(exportAsRecastNavMesh, {
        disabled: !signalNavMesh.value,
      }),
    },
    [generateNavMesh]
  );

  useControls("Exported Recast NavMesh offset", {
    x: signalNavMeshOffset.value?.x,
    y: signalNavMeshOffset.value?.y,
    z: signalNavMeshOffset.value?.z,
  });
};
