import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../assets/index.css";
import { ChevronDown, ChevronUp, Copy, Trash2, Edit } from "lucide-react";
import Pagination from "./Pagination";
import toast from "react-hot-toast";
import axiosBaseRequest from "../api/axiosBaseRequest";

const PointsTable = ({
  points,
  onView,
  currentPage,
  hasNext,
  onPrev,
  onNext,
  collectionName,
  onDelete: onDeleteCallback,
  onCopy, // Add this prop for handling copy operations
  searchPerformed, // Add this prop to show search status
}) => {
  const [expanded, setExpanded] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editPoint, setEditPoint] = useState(null);
  const [editPayloadText, setEditPayloadText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [localPoints, setLocalPoints] = useState(points);

  // Remove the local copyToClipboard function and use the onCopy prop instead
  const handleCopyPoint = (point, e) => {
    e.stopPropagation();
    const obj = {
      id: point.id,
      payload: point.payload || {},
      vector: point.vector || [],
    };
    if (onCopy) {
      onCopy(JSON.stringify(obj, null, 2), "Point");
    } else {
      // Fallback if onCopy is not provided
      navigator.clipboard
        .writeText(JSON.stringify(obj, null, 2))
        .then(() => {
          toast.success("Point copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard");
        });
    }
  };

  const handleDeleteClick = (pointId, e) => {
    e.stopPropagation();
    setDeletingId(pointId);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoadingDelete(true);
    try {
      await axiosBaseRequest.post(
        `/collections/${collectionName}/points/delete`,
        { points: [deletingId] }
      );

      if (typeof onDeleteCallback === "function") onDeleteCallback(deletingId);

      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete point", err);
      toast.error("Failed to delete point");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleOpenEdit = (point, e) => {
    if (e) e.stopPropagation();
    setEditPoint(point);
    setEditPayloadText(
      point.payload ? JSON.stringify(point.payload, null, 2) : "{}"
    );
  };

  const handleSaveEdit = async () => {
    if (!editPoint) return;
    let parsed;
    try {
      parsed = JSON.parse(editPayloadText);
    } catch {
      alert("Payload JSON is invalid. Please fix it before saving.");
      return;
    }

    setSavingEdit(true);
    try {
      const body = {
        points: [editPoint.id],
        payload: parsed,
      };

      await axiosBaseRequest.put(
        `/collections/${collectionName}/points/payload`,
        body
      );

      setLocalPoints((prev) =>
        prev.map((p) => (p.id === editPoint.id ? { ...p, payload: parsed } : p))
      );

      setEditPoint(null);
      toast.success("Payload updated successfully!");
    } catch (err) {
      console.error("Failed to upsert point", err);
      toast.error("Failed to update payload");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCopyPayload = (payload, e) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(JSON.stringify(payload || {}, null, 2), "Payload");
    } else {
      // Fallback if onCopy is not provided
      navigator.clipboard
        .writeText(JSON.stringify(payload || {}, null, 2))
        .then(() => {
          toast.success("Payload copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard");
        });
    }
  };

  const handleCopyVector = (vector, e) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(JSON.stringify(vector || [], null, 2), "Vector");
    } else {
      // Fallback if onCopy is not provided
      navigator.clipboard
        .writeText(JSON.stringify(vector || [], null, 2))
        .then(() => {
          toast.success("Vector copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard");
        });
    }
  };

  useEffect(() => {
    setLocalPoints(points);
  }, [points]);

  return (
    <div className="flex flex-col space-y-3">
      {/* No data found message */}
      {!points.length && (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
          {searchPerformed ? "No matching points found" : "No points available"}
        </div>
      )}

      <div className="space-y-3 flex-1">
        {localPoints.map((point) => {
          const isOpen = expanded === point.id;
          return (
            <div
              key={point.id}
              className="border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(isOpen ? null : point.id)}
              >
                <div className="flex items-center space-x-3 ">
                  <span className="text-blue-600 font-medium">
                    Point {point.id}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Copy point (full object) */}
                  <button
                    onClick={(e) => handleCopyPoint(point, e)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Copy full point (id,payload,vector)"
                  >
                    <Copy size={16} />
                  </button>

                  {/* Delete point */}
                  <button
                    onClick={(e) => handleDeleteClick(point.id, e)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                    title="Delete point"
                  >
                    <Trash2 size={16} />
                  </button>

                  {isOpen ? (
                    <ChevronUp className="text-gray-500" size={18} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={18} />
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="p-4 border-t border-gray-200 space-y-4">
                  {/* Payload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Payload:</h4>
                      {/* Buttons: copy whole payload & edit */}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => handleCopyPayload(point.payload, e)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center space-x-1 hover:bg-gray-200 transition-colors"
                        >
                          <Copy size={14} /> <span>Copy Payload</span>
                        </button>

                        <button
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded flex items-center space-x-1 hover:bg-yellow-200 transition-colors"
                          onClick={(e) => handleOpenEdit(point, e)}
                        >
                          <Edit size={14} /> <span>Edit Payload</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      {point.payload ? (
                        <div className="space-y-2 text-sm">
                          {Object.entries(point.payload).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-start space-x-2"
                            >
                              <span className="font-medium text-gray-600 w-40">
                                {key}
                              </span>
                              <span className="text-gray-800 flex-1 break-all">
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </span>
                              <div className="flex items-center space-x-2"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No payload
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vectors */}
                  <div>
                    <h4 className="font-medium mb-2">Vectors:</h4>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Default vector
                        </span>
                        <span className="text-xs text-gray-500">
                          Length: {point.vector ? point.vector.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => handleCopyVector(point.vector, e)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center space-x-1 hover:bg-gray-200 transition-colors"
                        >
                          <Copy size={14} /> <span>Copy Vector</span>
                        </button>
                        <button
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(point);
                          }}
                        >
                          OPEN GRAPH
                        </button>
                        <button
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Find similar", point);
                          }}
                        >
                          FIND SIMILAR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination - Only show if there are points */}
      {localPoints.length > 0 && (
        <Pagination
          currentPage={currentPage}
          onPrev={onPrev}
          onNext={onNext}
          hasNext={hasNext}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="font-semibold text-lg mb-3">Delete point?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete point{" "}
              <strong>{deletingId}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loadingDelete}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loadingDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit payload modal */}
      {editPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-6 w-11/12 max-w-2xl">
            <h3 className="font-semibold text-lg mb-3">
              Edit Payload for {editPoint.id}
            </h3>
            <textarea
              className="w-full h-64 p-3 border rounded text-sm font-mono"
              value={editPayloadText}
              onChange={(e) => setEditPayloadText(e.target.value)}
            />

            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setEditPoint(null)}
                className="px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PointsTable.propTypes = {
  points: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  hasNext: PropTypes.bool.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  collectionName: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func, // Add onCopy to propTypes
  searchPerformed: PropTypes.bool, // Add searchPerformed to propTypes
};

export default PointsTable;
