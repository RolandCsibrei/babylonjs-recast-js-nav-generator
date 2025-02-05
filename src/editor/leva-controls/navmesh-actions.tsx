import { button, useControls } from "leva";
import { useSignals } from "@preact/signals-react/runtime";

import { sigalnIsLoading, signalNavMesh } from "../signals";

export const useNavMeshActionsControls = ({
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
        disabled: sigalnIsLoading.value,
      }),
      "Export as Recast NavMesh": button(exportAsRecastNavMesh, {
        disabled: !signalNavMesh.value,
      }),
    },
    [generateNavMesh]
  );
};
