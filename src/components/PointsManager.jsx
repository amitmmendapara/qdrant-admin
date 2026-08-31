import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PointsTable from "./PointsTable";
import SnapshotsTable from "./SnapshotsTable";
// import Tabs from "./Tabs";
import { Search, X, Edit3 } from "lucide-react";
import axiosBaseRequest from "../api/axiosBaseRequest";
import PropTypes from "prop-types";

const PointsManager = ({ collectionName }) => {
  // const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab] = useState("points");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [nextOffset, setNextOffset] = useState(null);
  const [offsetHistory, setOffsetHistory] = useState([null]);

  // const tabs = [
  //   { id: "points", name: "POINTS" },
  //   { id: "snapshots", name: "SNAPSHOTS" },
  // ];

  // const handleTabChange = (tabId) => {
  //   if (tabId === "points") {
  //     navigate(`/collections/${collectionName}/points`);
  //   } else if (tabId === "snapshots") {
  //     navigate(`/collections/${collectionName}/snapshots`);
  //   }
  // };

  useEffect(() => {
    if (activeTab === "points") {
      fetchPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, activeTab]);

  const fetchPage = async (pageNumber = 1, offsetParam = undefined) => {
    setLoading(true);
    setSearchPerformed(false);
    try {
      const page = Math.max(1, pageNumber);
      const offsetToUse =
        offsetParam !== undefined
          ? offsetParam
          : offsetHistory[page - 1] ?? null;

      const resp = await axiosBaseRequest.post(
        `/collections/${collectionName}/points/scroll`,
        {
          offset: offsetToUse,
          limit: itemsPerPage,
          with_payload: true,
          with_vectors: true,
        }
      );

      const respPoints = resp?.data?.result?.points || [];
      const respNextOffset = resp?.data?.result?.next_page_offset ?? null;

      setPoints(respPoints);
      setCurrentPage(page);
      setNextOffset(respNextOffset);

      // Update offsetHistory so that offsetHistory[page-1] === offsetToUse
      setOffsetHistory((prev) => {
        const copy = [...prev];
        // ensure array has at least page entries
        while (copy.length < page) copy.push(null);
        copy[page - 1] = offsetToUse === undefined ? null : offsetToUse;
        return copy;
      });
    } catch (err) {
      console.error("Failed to retrieve points:", err);
      toast.error("Failed to retrieve points");
      setPoints([]); // Clear points on error
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!nextOffset) return;
    const nextPage = currentPage + 1;
    setOffsetHistory((prev) => {
      const newHist = [...prev];
      newHist.push(nextOffset);
      return newHist;
    });
    await fetchPage(nextPage, nextOffset);
  };

  const handlePrev = async () => {
    if (currentPage === 1) return;
    const prevPage = currentPage - 1;
    await fetchPage(prevPage);
  };

  const retrievePoint = async (query) => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      let filter = null;
      let idSearch = null;

      const conditions = query.split(",").map((c) => c.trim());

      for (const cond of conditions) {
        if (!cond) continue;
        const [rawKey, ...rest] = cond.split(":");
        const key = rawKey.trim();
        const value = rest.join(":").trim();

        if (key.toLowerCase() === "id") {
          idSearch = value;
        } else if (key && value) {
          if (!filter) filter = { must: [] };

          let parsedValue = value;
          if (!isNaN(Number(value))) parsedValue = Number(value);
          else if (value.toLowerCase() === "true") parsedValue = true;
          else if (value.toLowerCase() === "false") parsedValue = false;

          filter.must.push({
            key,
            match: { value: parsedValue },
          });
        }
      }

      if (idSearch) {
        // Direct ID lookup
        try {
          const response = await axiosBaseRequest.get(
            `/collections/${collectionName}/points/${idSearch}`
          );
          setPoints([response.data.result]);
          setCurrentPage(1);
          setOffsetHistory([null]);
          setNextOffset(null);
          toast.success("Point retrieved successfully");
          return;
        } catch (error) {
          // Handle point not found case specifically
          if (
            error.response?.data?.status?.error?.includes("does not exists")
          ) {
            setPoints([]); // Clear points when not found
            setCurrentPage(1);
            setOffsetHistory([null]);
            setNextOffset(null);
            toast.error("Point not found");
            return;
          }
          throw error; // Re-throw other errors
        }
      }

      if (filter) {
        // Scroll API with filter
        const resp = await axiosBaseRequest.post(
          `/collections/${collectionName}/points/scroll`,
          {
            filter,
            limit: itemsPerPage,
            with_payload: true,
            with_vectors: true,
          }
        );

        const respPoints = resp?.data?.result?.points || [];
        const respNextOffset = resp?.data?.result?.next_page_offset ?? null;

        setPoints(respPoints);
        setCurrentPage(1);
        setNextOffset(respNextOffset);
        setOffsetHistory([null]);

        if (respPoints.length === 0) {
          toast.error("No matching points found");
        } else {
          toast.success(`${respPoints.length} point(s) retrieved`);
        }
        return;
      }

      // fallback → assume input is an ID
      try {
        const response = await axiosBaseRequest.get(
          `/collections/${collectionName}/points/${query}`
        );
        setPoints([response.data.result]);
        setCurrentPage(1);
        setOffsetHistory([null]);
        setNextOffset(null);
        toast.success("Point retrieved successfully");
      } catch (error) {
        // Handle point not found case specifically
        if (error.response?.data?.status?.error?.includes("does not exists")) {
          setPoints([]); // Clear points when not found
          setCurrentPage(1);
          setOffsetHistory([null]);
          setNextOffset(null);
          toast.error("Point not found");
          return;
        }
        throw error; // Re-throw other errors
      }
    } catch (error) {
      console.error("Search error:", error);

      // Check if it's a "not found" error
      if (error.response?.data?.status?.error?.includes("does not exists")) {
        setPoints([]); // Clear points when not found
        setCurrentPage(1);
        setOffsetHistory([null]);
        setNextOffset(null);
        toast.error("Point not found");
      } else {
        toast.error("No matching points found");
        setPoints([]); // Clear points on other errors too
        setCurrentPage(1);
        setOffsetHistory([null]);
        setNextOffset(null);
      }
    }
  };

  const upsertPoint = async (pointData) => {
    try {
      const body = {
        points: pointData.points,
      };

      await axiosBaseRequest.put(`/collections/${collectionName}/points`, body);

      toast.success("Point upserted successfully");
      setShowUpsertModal(false);
      fetchPage(currentPage);
    } catch (error) {
      toast.error("Failed to upsert point");
      console.error(error);
    }
  };

  const deletePoints = async (id) => {
    if (!confirm("Are you sure you want to delete this point?")) return;

    try {
      await axiosBaseRequest.post(
        `/collections/${collectionName}/points/delete`,
        { points: [id] }
      );

      toast.success("Point deleted successfully");
      fetchPage(currentPage);
    } catch (error) {
      toast.error("Failed to delete point");
      console.error(error);
    }
  };

  const clearSearch = () => {
    setSearchId("");
    setOffsetHistory([null]);
    setNextOffset(null);
    fetchPage(1);
  };

  const handlePointClick = (point) => {
    setSelectedPoint(point);
  };

  return (
    <div className="overflow-x-auto h-full custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="md:col-span-2 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Find similar by ID or filter by payload key:value pair"
              className="border border-gray-300 p-2 pl-10 rounded-lg w-full "
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && retrievePoint(searchId)}
            />
          </div>
          <button
            onClick={() => retrievePoint(searchId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Search size={18} className="mr-1" />
            Search
          </button>
          {searchId && (
            <button
              onClick={clearSearch}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedPoint(null);
              setShowUpsertModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center flex-1"
          >
            <Edit3 size={18} className="mr-1" />
            Create Point
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PointsTable
          points={points}
          onView={(point) => handlePointClick(point)}
          currentPage={currentPage}
          hasNext={!!nextOffset}
          onPrev={handlePrev}
          onNext={handleNext}
          loading={loading}
          collectionName={collectionName}
          onEdit={(point) => {
            setSelectedPoint(point);
            setShowUpsertModal(true);
          }}
          onDelete={deletePoints}
        />
      </div>

      {activeTab === "snapshots" && (
        <SnapshotsTable collectionName={collectionName} />
      )}

      {showUpsertModal && (
        <UpsertModal
          point={selectedPoint}
          onSave={upsertPoint}
          onClose={() => {
            setShowUpsertModal(false);
            setSelectedPoint(null);
          }}
        />
      )}
    </div>
  );
};

// UpsertModal component remains the same as before
const UpsertModal = ({ point, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: point?.id || "",
    vector: point?.vector ? JSON.stringify(point.vector) : "[]",
    payload: point?.payload ? JSON.stringify(point.payload, null, 2) : "{}",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = "ID is required";
    }

    try {
      const vectorArray = JSON.parse(formData.vector);
      if (!Array.isArray(vectorArray)) {
        newErrors.vector = "Vector must be a valid array";
      } else if (vectorArray.length === 0) {
        newErrors.vector = "Vector cannot be empty";
      }
    } catch {
      newErrors.vector = "Vector must be a valid JSON array";
    }

    try {
      JSON.parse(formData.payload);
    } catch {
      newErrors.payload = "Payload must be a valid JSON object";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const pointData = {
        points: [
          {
            id: formData.id,
            vector: JSON.parse(formData.vector),
            payload: JSON.parse(formData.payload),
          },
        ],
      };
      onSave(pointData);
    } catch (error) {
      console.error("Invalid data format:", error);
      toast.error("Invalid data format");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            {point ? "Edit Point" : "Create Point"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Point ID
                </label>
                <input
                  type="text"
                  className={`border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.id ? "border-red-500" : ""
                  }`}
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  required
                  placeholder="Enter point ID"
                />
                {errors.id && (
                  <p className="text-red-500 text-xs mt-1">{errors.id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vector (JSON array)
                </label>
                <textarea
                  className={`border border-gray-300 p-3 w-full rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vector ? "border-red-500" : ""
                  }`}
                  rows={8}
                  value={formData.vector}
                  onChange={(e) =>
                    setFormData({ ...formData, vector: e.target.value })
                  }
                  required
                  placeholder="[0.1, 0.2, 0.3, ...]"
                />
                {errors.vector && (
                  <p className="text-red-500 text-xs mt-1">{errors.vector}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payload (JSON object)
              </label>
              <textarea
                className={`border border-gray-300 p-3 w-full rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payload ? "border-red-500" : ""
                }`}
                rows={14}
                value={formData.payload}
                onChange={(e) =>
                  setFormData({ ...formData, payload: e.target.value })
                }
                placeholder='{"key": "value", "tags": ["tag1", "tag2"]}'
              />
              {errors.payload && (
                <p className="text-red-500 text-xs mt-1">{errors.payload}</p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {point ? "Update Point" : "Create Point"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PointsManager.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default PointsManager;
