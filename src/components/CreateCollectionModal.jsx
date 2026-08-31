// components/CreateCollectionModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import axiosBaseRequest from "../api/axiosBaseRequest";

const CreateCollectionModal = ({ isOpen, onClose, onCreate }) => {
  const [collectionName, setCollectionName] = useState("");
  const [vectorSize, setVectorSize] = useState(1024);
  const [distanceMetric, setDistanceMetric] = useState("Cosine");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCollectionName("");
    setVectorSize(1024);
    setDistanceMetric("Cosine");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      vectors: {
        "dense-vector-name": {
          size: Number(vectorSize),
          distance: distanceMetric,
        },
      },
      sparse_vectors: {
        "sparse-vector-name": {
          index: {
            on_disk: true,
          },
        },
      },
    };

    try {
      const res = await axiosBaseRequest.put(
        `/collections/${collectionName}`,
        payload
      );

      if (res.status !== 200) {
        throw new Error(`Failed to create collection: ${res.statusText}`);
      }

      // Notify parent with response data
      onCreate(collectionName, res.data);

      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Collection</h2>
        <form onSubmit={handleSubmit}>
          {/* Collection Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Collection Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Enter collection name"
              className="border p-2 w-full rounded"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              required
            />
          </div>

          {/* Vector Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Vector Size
            </label>
            <input
              type="number"
              min={1}
              className="border p-2 w-full rounded"
              value={vectorSize}
              onChange={(e) => setVectorSize(Number(e.target.value))}
              required
            />
          </div>

          {/* Distance Metric */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Distance Metric
            </label>
            <select
              className="border p-2 w-full rounded"
              value={distanceMetric}
              onChange={(e) => setDistanceMetric(e.target.value)}
              required
            >
              <option value="Cosine">Cosine</option>
              <option value="Euclidean">Euclidean</option>
              <option value="Dot">Dot</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateCollectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default CreateCollectionModal;
