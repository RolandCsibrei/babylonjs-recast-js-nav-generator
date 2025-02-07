import "./App.css";
import { useEffect } from "react";

import { EditorPage } from "./pages/EditorPage";
import FileLoader from "./components/FileLoader";
import { EditorScene } from "./scenes/EditorScene";

import { signalEditor } from "./state/signals";

function App() {
  // create the Editor instance
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const editorScene = new EditorScene(canvas);

  useEffect(() => {
    // init the Editor
    editorScene.init().then(() => {
      signalEditor.value = editorScene;
    });
  });
  return (
    <>
      <FileLoader />
      <EditorPage />
    </>
  );
}

export default App;
