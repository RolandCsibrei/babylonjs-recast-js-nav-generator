import { button, useControls } from "leva";
import { useSignals } from "@preact/signals-react/runtime";

import {
  sigalnIsLoading,
  signalModelBlob,
  signalNavMesh,
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
        disabled: sigalnIsLoading.value || !signalModelBlob.value,
      }),
      "Export as Recast NavMesh": button(exportAsRecastNavMesh, {
        disabled: !signalNavMesh.value,
      }),
    },
    [generateNavMesh]
  );
};
