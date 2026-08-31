// components/ApiConfig.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const ApiConfig = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("qdrant_api_key") || ""
  );

  const saveConfig = () => {
    localStorage.setItem("qdrant_api_key", apiKey);
    toast.success("API configuration saved");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">API Configuration</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            className="border p-2 w-full rounded"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Qdrant API key"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={saveConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
ApiConfig.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApiConfig;
