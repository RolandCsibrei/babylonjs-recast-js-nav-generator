import { useControls } from "leva";
import { DebugDrawerOption } from "../../plugin/debug-drawer";
import { signalDebugDrawerControls } from "../state/signals";
import { levaText } from "./plugins/leva-text";

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
