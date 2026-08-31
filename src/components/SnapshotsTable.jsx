import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { FileArchive, Loader2 } from "lucide-react";
import ActionMenu from "./ActionMenu";
import axiosBaseRequest from "../api/axiosBaseRequest";

// Utility: format timestamp
const formatDate = (ts) => {
  if (!ts) return "-";
  const num = Number(ts);
  let date;
  if (!Number.isNaN(num)) {
    date = num.toString().length <= 10 ? new Date(num * 1000) : new Date(num);
  } else {
    date = new Date(ts);
  }
  if (Number.isNaN(date.getTime())) return ts;
  return date.toLocaleString();
};

const humanBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

const SnapshotsTable = ({ collectionName }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosBaseRequest.get(
        `/collections/${collectionName}/snapshots`
      );
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.result || [];
      setSnapshots(list);
    } catch (err) {
      console.error("Error fetching snapshots:", err);
      setError(
        err?.response?.data?.error || err.message || "Failed to fetch snapshots"
      );
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    if (!collectionName) return;
    fetchSnapshots();
  }, [collectionName, fetchSnapshots]);

  const handleTakeSnapshot = async () => {
    setCreating(true);
    setError(null);
    try {
      await axiosBaseRequest.post(`/collections/${collectionName}/snapshots`);
      await fetchSnapshots();
    } catch (err) {
      console.error("Error creating snapshot:", err);
      setError(
        err?.response?.data?.error || err.message || "Failed to create snapshot"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (snapName) => {
    setActionLoading((s) => ({ ...s, [snapName]: true }));
    setError(null);
    try {
      const url = `/collections/${collectionName}/snapshots/${encodeURIComponent(
        snapName
      )}`;
      const res = await axiosBaseRequest.get(url, {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = snapName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      setError(err?.response?.data?.error || err.message || "Download failed");
    } finally {
      setActionLoading((s) => ({ ...s, [snapName]: false }));
    }
  };

  const handleDelete = async (snapName) => {
    const ok = window.confirm(`Delete snapshot "${snapName}"?`);
    if (!ok) return;
    setActionLoading((s) => ({ ...s, [snapName]: true }));
    setError(null);
    try {
      await axiosBaseRequest.delete(
        `/collections/${collectionName}/snapshots/${encodeURIComponent(
          snapName
        )}`
      );
      setSnapshots((prev) => prev.filter((p) => p.name !== snapName));
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err?.response?.data?.error || err.message || "Delete failed");
      await fetchSnapshots();
    } finally {
      setActionLoading((s) => ({ ...s, [snapName]: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold text-black">Snapshots</h3>
        <div className="flex items-center gap-3">
          {error && (
            <div className="text-sm text-red-600 truncate max-w-xs">
              {error}
            </div>
          )}
          <button
            onClick={handleTakeSnapshot}
            disabled={creating}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Creating...
              </>
            ) : (
              <>
                <span className="select-none">📸</span>
                <span className="ml-2">Take Snapshot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500 flex-shrink-0">
          Loading snapshots...
        </div>
      ) : (
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-sm min-w-full h-full">
            <thead className="bg-gray-900 text-white sticky top-0">
              <tr>
                <th className="p-3 text-left min-w-[200px]">Snapshot Name</th>
                <th className="p-3 text-left whitespace-nowrap min-w-[150px]">
                  Created at
                </th>
                <th className="p-3 text-left whitespace-nowrap min-w-[100px]">
                  Size
                </th>
                <th className="p-3 text-left whitespace-nowrap min-w-[120px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="h-full">
              {snapshots.length === 0 && (
                <tr className="bg-white">
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No snapshots found.
                  </td>
                </tr>
              )}

              {snapshots.map((snap, idx) => {
                const name = snap.name || snap.snapshot_name || snap;
                const creatingOrAction = actionLoading[name];
                return (
                  <tr
                    key={name}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="p-3 flex items-center gap-3 text-black">
                      <FileArchive
                        className="text-blue-600 flex-shrink-0"
                        size={18}
                      />
                      <span className="break-words whitespace-normal min-w-0">
                        {name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {formatDate(snap.creation_time || snap.created_at)}
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {humanBytes(snap.size)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: creatingOrAction
                              ? "Downloading..."
                              : "Download",
                            onClick: () => handleDownload(name),
                            disabled: creatingOrAction,
                            icon: "Download",
                          },
                          {
                            label: creatingOrAction ? "Deleting..." : "Delete",
                            onClick: () => handleDelete(name),
                            icon: "Trash2",
                            variant: "danger",
                          },
                        ]}
                        position="left"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

SnapshotsTable.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default SnapshotsTable;
