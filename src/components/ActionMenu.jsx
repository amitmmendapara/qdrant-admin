import { MoreVertical } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

const ActionMenu = ({ items, position = "right", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const positionClasses = {
    right: "right-0",
    left: "left-0",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute ${positionClasses[position]} mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-10`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm break-words ${
                item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "hover:bg-gray-100"
              }`}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ActionMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(["default", "danger"]),
      disabled: PropTypes.bool,
    })
  ).isRequired,
  position: PropTypes.oneOf(["left", "right"]),
  className: PropTypes.string,
};

export default ActionMenu;
