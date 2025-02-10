import { useControls } from "leva";
import { signalClipPlanes } from "../state/signals";
import { levaText } from "./plugins/leva-text";

export const useClipPlaneControls = () => {
  signalClipPlanes.value = useControls("Clip planes", {
    _: levaText(
      "You can use the clip planes to clip portion of your model or the navigation mesh."
    ),
    useClipPlanes: {
      label: "Use clip planes",
      value: false,
    },
  });
};
