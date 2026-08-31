import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import axiosBaseRequest from "../api/axiosBaseRequest";

const UploadSnapshotModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef();
  const [step, setStep] = useState(1);
  const [collectionName, setCollectionName] = useState("");
  const [snapshotFile, setSnapshotFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCollectionName("");
      setSnapshotFile(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        if (uploadProgress < 100 && snapshotFile) {
          handleUpload(snapshotFile);
        }
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, snapshotFile, uploadProgress]);

  const handleContinue = () => {
    if (collectionName.trim() !== "") {
      setStep(2);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSnapshotFile(files);
      handleUpload(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    setSnapshotFile(files);
    if (files && files.length > 0) {
      handleUpload(files);
    }
  };

  const handleUpload = async (fileList) => {
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("snapshot", fileList[0]);
    try {
      await axiosBaseRequest.post(
        `collections/${collectionName}/snapshots/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-xl"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Upload a Snapshot</h2>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 mr-2">
                  1
                </div>
                <span className="font-semibold">
                  Step 1 - Enter a collection name
                </span>
              </div>

              <p className="mb-2">Can be new or existing</p>
              <label className="text-blue-200">Collection Name</label>
              <input
                type="text"
                className="block w-full bg-gray-900 border border-blue-300 rounded mt-2 mb-6 px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={collectionName}
                autoFocus
                onChange={(e) => setCollectionName(e.target.value)}
              />
              <button
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:bg-gray-600"
                onClick={handleContinue}
                disabled={!collectionName.trim()}
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 mr-2">
                  2
                </div>
                <span className="font-semibold">
                  Step 2 - Upload a snapshot file
                </span>
              </div>

              <div
                className="w-full h-40 border-2 border-dashed border-gray-400 rounded-2xl 
             bg-gradient-to-br from-gray-900 to-black flex flex-col items-center 
             justify-center cursor-pointer transition-all duration-200 
             hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 mb-6"
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Icon */}
                <div className="text-5xl mb-3 text-blue-400 animate-bounce">
                  ⬇️
                </div>

                {/* Text */}
                <p className="text-white text-sm font-medium">
                  Click or Drag & Drop your{" "}
                  <span className="text-blue-400">.snapshot</span> file here
                </p>

                {/* Hidden Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".snapshot"
                />
              </div>

              {uploadProgress > 0 && (
                <div className="mb-4 text-center">
                  Upload progress: {uploadProgress}%
                  <progress value={uploadProgress} max="100"></progress>
                </div>
              )}

              <div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setStep(1)}
                >
                  BACK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
UploadSnapshotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default UploadSnapshotModal;
