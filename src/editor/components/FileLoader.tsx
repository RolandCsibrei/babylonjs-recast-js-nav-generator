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
      placeholder=""
      type="file"
      accept=".glb"
      onChange={handleFileChange}
    />
  );
};

export default FileLoader;
