import { useControls } from "leva";
import { levaText } from "./leva-text";
import { signalClippingPlanes } from "../signals";

export const useCliPlaneOptionsControls = () => {
  signalClippingPlanes.value = useControls("Cliiping planes", {
    _: levaText(
      "You can use the clipping planes to clip portion of your model or the navigation mesh."
    ),
    useClipPlane1: {
      label: "Use clipping plane Top",
      value: false,
    },
    useClipPlane2: {
      label: "Use clipping plane Bottom",
      value: false,
    },
  });
};
