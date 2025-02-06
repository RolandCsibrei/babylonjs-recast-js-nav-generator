import { signalModelBlob } from "../signals";

const FileLoader = () => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" });
        signalModelBlob.value = blob;
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <input
      id="load-glb"
      type="file"
      accept=".glb"
      onChange={handleFileChange}
      style={{ display: "none" }}
    />
  );
};

export default FileLoader;
