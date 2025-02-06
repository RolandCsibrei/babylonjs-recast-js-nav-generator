import { useControls } from "leva";
import { levaText } from "./leva-text";
import { DebugDrawerOption } from "./debug-drawer";
import { signalDebugDrawerControls } from "../signals";

export const useDebugDrawerControls = () => {
  signalDebugDrawerControls.value = useControls("Display Options.NavMesh", {
    _: levaText("The computed navigation mesh."),
    navMeshDebugDraw: {
      label: "Show NavMesh Debug Drawer",
      value: true,
    },
    navMeshDebugDrawOption: {
      label: "Display",
      value: DebugDrawerOption.NAVMESH,
      options: Object.values(DebugDrawerOption),
    },
  });
};
