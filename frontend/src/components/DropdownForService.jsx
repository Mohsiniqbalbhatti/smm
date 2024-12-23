import { useEffect, useRef, useState } from "react";

const DropdownForService = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const handleOptionClick = (option) => {
    onChange(option); // Call onChange with the selected option's value
    setIsOpen(false); // Close dropdown on selection
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev); // Toggle dropdown open/close
  };

  // Handle clicks outside of the dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false); // Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    // Bind the click event to the document
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="custom-trigger" onClick={toggleDropdown}>
        {value || placeholder}
      </div>
      {isOpen && (
        <div className="custom-options">
          {options.map((option) => (
            <span
              key={option._id} // Assuming each category has a unique _id
              className="custom-option"
              onClick={() => handleOptionClick(option)} // Pass the name or value of the option
            >
              {option.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
export default DropdownForService;
