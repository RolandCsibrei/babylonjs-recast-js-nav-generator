import { drawDebug } from "../../plugin/debug-drawer";
import { RecastNavigationJSPluginDebug } from "../../plugin/RecastNavigationJSPluginDebug";
import {
  signalDebugDrawerControls,
  signalGeneratorIntermediates,
  signalNavMesh,
} from "../state/signals";

export function subscribeDebugDrawerControls() {
  const debug = new RecastNavigationJSPluginDebug();

  signalDebugDrawerControls.subscribe((controls) => {
    const navMesh = signalNavMesh.peek();
    if (!debug || !navMesh || !controls?.navMeshDebugDrawOption) {
      return;
    }

    drawDebug(
      debug,
      navMesh,
      controls.navMeshDebugDrawOption,
      signalGeneratorIntermediates.peek()
    );
  });
}
