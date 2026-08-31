// components/DeleteConfirmationModal.jsx
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  collectionName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">
          Are you sure you want to delete the collection{" "}
          <span className="font-semibold">{collectionName}</span>?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(collectionName)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

import PropTypes from "prop-types";

DeleteConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  collectionName: PropTypes.string.isRequired,
};

export default DeleteConfirmationModal;
