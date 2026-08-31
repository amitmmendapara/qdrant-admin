import PropTypes from "prop-types";

const Pagination = ({ currentPage, onPrev, onNext, hasNext }) => {
  return (
    <div className="flex justify-between items-center p-3 border-t bg-white">
      {/* Previous Button */}
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
      >
        Previous
      </button>

      {/* Page indicator */}
      <span className="px-3 py-1 text-sm text-gray-600">
        Page {currentPage} {hasNext ? "" : "(last)"}
      </span>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired, // Current page number
  onPrev: PropTypes.func.isRequired, // Handler for previous
  onNext: PropTypes.func.isRequired, // Handler for next
  hasNext: PropTypes.bool.isRequired, // If Qdrant returned next_page_offset
};

export default Pagination;
