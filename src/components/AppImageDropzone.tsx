import { useState, useRef } from "react";
import use8baseStorage from "@/hooks/use8baseStorage";
import AppImage from "./AppImage";
import AppLoader from "./AppLoader";

const useDropZone = (onDrop: (files: FileList) => Promise<void>) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files);
    }
  };

  return { isOver, handleDragOver, handleDragLeave, handleDrop };
};

const AppImageDropzone = ({ image, loading, className, onUpload }: {
    image?: string
    loading?: boolean
    className?: string
    onUpload: (id: string) => void
}) => {
  const [uploading, setUploading] = useState(false);
  const dropzoneRef = useRef(null);
  const { uploadAsset } = use8baseStorage();

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const res = await uploadAsset(files[0]);
    onUpload(res?.data.fileCreate?.id);
    setUploading(false);
  };

  const { isOver, handleDragOver, handleDragLeave, handleDrop } = useDropZone(handleFiles);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div
      ref={dropzoneRef}
      className={`bg-gray-100 p-2 flex justify-center items-center border-2 relative ${className} ${
        isOver ? "border-blue-200" : "border-gray-100"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="absolute top-0 left-0 right-0 bottom-0 block z-10">
        <input accept="image/png, image/jpeg" className="hidden" type="file" onChange={handleFileSelect} />
      </label>
      {image ? <AppImage src={image} className="aspect-video w-56" /> : "Click or drop to upload image"}
      {(loading || uploading) && <AppLoader overlay={true} />}
    </div>
  );
};
    
export default AppImageDropzone