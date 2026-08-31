import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ActionMenu from "./ActionMenu";

const CollectionsTable = ({ collections, loading, searchTerm, onDelete }) => {
  const navigate = useNavigate();

  const handleViewPoints = (collectionName) => {
    navigate(`/collections/${collectionName}/points`);
  };

  if (loading) {
    return (
      <div className="border px-4 py-4 text-center">Loading collections...</div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="border px-4 py-4 text-center">
        {searchTerm ? "No matching collections found" : "No collections found"}
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-90px)] overflow-x-auto custom-scrollbar">
      <table className="w-full text-sm border-collapse overflow-y-auto h-screen">
        {/* Table Head */}
        <thead className="bg-gray-900 text-white z-50">
          <tr>
            <th className="border px-4 py-3 text-left font-semibold">Name</th>
            <th className="border px-4 py-3 text-left font-semibold">Status</th>
            <th className="border px-4 py-3 text-left font-semibold">
              Points (Approx)
            </th>
            <th className="border px-4 py-3 text-left font-semibold">
              Segments
            </th>
            <th className="border px-4 py-3 text-left font-semibold">Shards</th>
            <th className="border px-4 py-3 text-left font-semibold break-words">
              Vectors Config (Name, Size, Distance)
            </th>
            <th className="border px-4 py-3 text-left font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="h-full">
          {collections.map((collection, index) => (
            <tr
              key={collection.name}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-gray-100 transition`}
            >
              <td className="border px-4 py-3 font-medium whitespace-nowrap">
                <button
                  onClick={() => handleViewPoints(collection.name)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {collection.name}
                </button>
              </td>

              <td className="border px-4 py-3">
                <span className="inline-flex items-center">
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${
                      collection.status === "green"
                        ? "bg-green-500"
                        : collection.status === "yellow"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  />
                  {collection.status || "Unknown"}
                </span>
              </td>

              <td className="border px-4 py-3 text-gray-700 text-center">
                {collection.pointsCount || 0}
              </td>

              <td className="border px-4 py-3 text-center">
                {collection.segments ?? 2}
              </td>

              <td className="border px-4 py-3 text-center">
                {collection.shards ?? 1}
              </td>

              <td className="border px-4 py-3">
                <div className="flex flex-col gap-1 text-gray-700">
                  <span>{collection.vectorName || "N/A"}</span>
                  <span>{collection.dimensions ?? "-"}</span>
                  <span>{collection.distance || "-"}</span>
                </div>
              </td>

              <td className="border px-4 py-3 text-center">
                <ActionMenu
                  items={[
                    {
                      label: "Points",
                      onClick: () => handleViewPoints(collection.name),
                    },
                    {
                      label: "Delete",
                      onClick: () => onDelete(collection.name),
                      variant: "danger",
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CollectionsTable.propTypes = {
  collections: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
  }),
};

export default CollectionsTable;
