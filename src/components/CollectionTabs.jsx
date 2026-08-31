// components/CollectionTabs.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";

const CollectionTabs = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isPointsActive = location.pathname.includes("points");
  const isSnapshotsActive = location.pathname.includes("snapshots");

  const tabs = [
    {
      id: "points",
      name: "POINTS",
      path: `/collections/${collectionName}/points`,
    },
    {
      id: "snapshots",
      name: "SNAPSHOTS",
      path: `/collections/${collectionName}/snapshots`,
    },
  ];

  const handleTabChange = (tabPath) => {
    navigate(tabPath);
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive =
            (tab.id === "points" && isPointsActive) ||
            (tab.id === "snapshots" && isSnapshotsActive);

          return (
            <button
              key={tab.id}
              className={`py-2 px-1 text-sm font-medium ${
                isActive
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => handleTabChange(tab.path)}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionTabs;
