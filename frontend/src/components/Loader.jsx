import React from "react";
import { TailSpin } from "react-loader-spinner";

function Loader() {
  return (
    <div
      style={{
        position: "fixed", // Make the loader cover the full screen
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: Add a semi-transparent background
        zIndex: 9999, // Ensure it sits above other elements
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <TailSpin
        height={80} // Set the height of the spinner
        width={80} // Set the width of the spinner
        color="#ff2600" // Color of the spinner
        ariaLabel="tail-spin-loading" // Accessible label
        radius="1" // Adjust radius if needed
        wrapperStyle={{}} // Optional: any additional styles
        visible={true} // Control visibility
      />
    </div>
  );
}

export default Loader;
