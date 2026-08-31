import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, Download, Trash2 } from "lucide-react";
import axiosBaseRequest from "../api/axiosBaseRequest";
import PropTypes from "prop-types";

const SnapshotsManager = ({ collectionName, onBack }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchSnapshots();
  }, [collectionName]);

  const fetchSnapshots = async () => {
    setLoading(true);
    try {
      const response = await axiosBaseRequest.get(
        `/collections/${collectionName}/snapshots`
      );
      setSnapshots(response.data.result.snapshots || []);
    } catch (error) {
      toast.error("Failed to fetch snapshots");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSnapshot = async (snapshotName) => {
    try {
      const response = await axiosBaseRequest.get(
        `/collections/${collectionName}/snapshots/${snapshotName}`,
        { responseType: "blob" }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", snapshotName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Snapshot downloaded successfully");
    } catch (error) {
      toast.error("Failed to download snapshot");
      console.error(error);
    }
  };

  const deleteSnapshot = async (snapshotName) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;

    try {
      await axiosBaseRequest.delete(
        `/collections/${collectionName}/snapshots/${snapshotName}`
      );
      toast.success("Snapshot deleted successfully");
      fetchSnapshots();
    } catch (error) {
      toast.error("Failed to delete snapshot");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Snapshots for {collectionName}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-600">
            Loading snapshots...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Collections
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Snapshots for {collectionName}
          </h2>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          <Upload size={18} className="mr-1" />
          Upload Snapshot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Snapshot Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created at
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {snapshots.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No snapshots found for this collection
                </td>
              </tr>
            ) : (
              snapshots.map((snapshot) => (
                <tr key={snapshot.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {snapshot.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(snapshot.creation_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {snapshot.size
                      ? `${(snapshot.size / 1024 / 1024).toFixed(2)} MB`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadSnapshot(snapshot.name)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Download size={16} className="mr-1" /> Download
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snapshot.name)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Snapshot Modal would go here */}
    </div>
  );
};
SnapshotsManager.propTypes = {
  collectionName: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default SnapshotsManager;
