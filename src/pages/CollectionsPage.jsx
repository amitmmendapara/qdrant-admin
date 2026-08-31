// pages/CollectionsPage.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import Pagination from "../components/Pagination";
import axiosBaseRequest from "../api/axiosBaseRequest";
import CollectionsTable from "../components/CollectionsTable";
import UploadSnapshotModal from "../components/UploadSnapshotModel";
import CreateCollectionModal from "../components/CreateCollectionModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const itemsPerPage = 100;

  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await axiosBaseRequest.get("/collections");
      const data = Array.isArray(res.data.result?.collections)
        ? res.data.result.collections
        : [];

      // Fetch points count for each collection
      const collectionsWithPoints = await Promise.all(
        data.map(async (collection) => {
          try {
            const response = await axiosBaseRequest.post(
              `/collections/${collection.name}/points/count`,
              { exact: true }
            );
            return {
              ...collection,
              pointsCount: response.data.result.count,
            };
          } catch (error) {
            console.error("Failed to count points for", collection.name, error);
            return {
              ...collection,
              pointsCount: 0,
            };
          }
        })
      );

      setCollections(collectionsWithPoints);
    } catch (err) {
      toast.error("Failed to fetch collections");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (collectionData) => {
    try {
      await axiosBaseRequest.put(
        `/collections/${collectionData.collectionName}`,
        {
          vectors: {
            size: parseInt(collectionData.vectorSize),
            distance: collectionData.distanceMetric,
          },
        }
      );
      toast.success("Collection created successfully");
      fetchCollections(); // Refresh the list
    } catch (err) {
      toast.error("Failed to create collection");
      console.error(err);
    }
  };

  const confirmDelete = (collectionName) => {
    setCollectionToDelete(collectionName);
    setIsDeleteModalOpen(true);
  };

  const deleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      await axiosBaseRequest.delete(`/collections/${collectionToDelete}`);
      toast.success("Collection deleted successfully");

      // If we're viewing points from the deleted collection, clear them
      if (selectedCollection === collectionToDelete) {
        setSelectedCollection(null);
      }

      fetchCollections(); // Refresh the list
    } catch (err) {
      toast.error("Failed to delete collection");
      console.error(err);
    } finally {
      setIsDeleteModalOpen(false);
      setCollectionToDelete(null);
    }
  };

  const handleViewPoints = (collectionName) => {
    navigate(`/collections/${collectionName}/points`);
  };

  // Filter collections based on search term
  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedData = filteredCollections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between gap-2 items-center mb-6">
        <h2 className="text-2xl font-bold">
          {/* {selectedCollection
            ? `Points in ${selectedCollection}`
            : `Collections (${collections.length} / 1000)`} */}
          Collection
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center uppercase bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <Plus className="inline flex-shrink-0 mr-2" size={16} />
            Create Collection
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center uppercase bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <FileUp className="inline flex-shrink-0 mr-2" size={16} />
            Upload Snapshot
          </button>
        </div>
      </div>

      <div className="p-2 bg-gray-200 rounded-md mb-2">
        <input
          type="text"
          placeholder="Search Collection"
          className="border p-2 rounded w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <CollectionsTable
          collections={paginatedData}
          loading={loading}
          searchTerm={searchTerm}
          onDelete={confirmDelete}
          onViewPoints={handleViewPoints}
        />
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createCollection}
      />

      {/* Upload Collection Modal */}
      <UploadSnapshotModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onCreate={createCollection}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCollectionToDelete(null);
        }}
        onConfirm={deleteCollection}
        collectionName={collectionToDelete}
      />
    </div>
  );
};

export default CollectionsPage;
