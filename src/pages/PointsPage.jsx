// pages/PointsPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import PointsManager from "../components/PointsManager";
import CollectionTabs from "../components/CollectionTabs";

const PointsPage = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/collections");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-3">
        <button
          onClick={handleBack}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Back
        </button>
        <h2 className="ml-3 text-xl font-semibold text-gray-800">
          {collectionName}
        </h2>
      </div>

      <CollectionTabs />

      <div className="flex-1 overflow-hidden">
        <PointsManager collectionName={collectionName} />
      </div>
    </div>
  );
};

export default PointsPage;
