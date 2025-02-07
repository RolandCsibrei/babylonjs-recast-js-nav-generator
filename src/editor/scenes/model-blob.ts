import { ISceneLoaderAsyncResult } from "@babylonjs/core/Loading/sceneLoader.js";
import { Nullable } from "@babylonjs/core/types";

import { EditorScene } from "./EditorScene";
import { DefaultGlbSize, signalModelBlob } from "../state/signals";
import {
  loadDefaultGlbBig,
  loadDefaultGlbSmall,
  loadModelFromBlob,
} from "../utils/scene-loader";
import { TAG_MODEL } from "../utils/tags";
import { Tags } from "@babylonjs/core/Misc/tags";
import { zoomOnScene } from "../utils/camera";

export function subscribeModelBlob(editor: EditorScene) {
  // TODO: unsubscribe
  signalModelBlob.subscribe(async (blob) => {
    editor._removeExistingModels();

    // editor._resetCamera();

    if (!blob) {
      return;
    }

    let loaded: Nullable<ISceneLoaderAsyncResult> = null;
    if (blob instanceof Blob) {
      loaded = await loadModelFromBlob(blob, "model.glb", editor._scene);
    } else {
      if (blob === DefaultGlbSize.Big) {
        loaded = await loadDefaultGlbBig();
      } else {
        loaded = await loadDefaultGlbSmall();
      }
    }

    for (const m of loaded?.meshes ?? []) {
      m.isPickable = false;
      Tags.AddTagsTo(m, TAG_MODEL);
    }

    zoomOnScene(editor._scene, editor._camera);
  });
}
