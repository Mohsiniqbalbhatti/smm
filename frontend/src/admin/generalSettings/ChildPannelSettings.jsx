import React from "react";

function ChildPannelSettings() {
  return (
    <div>
      <div className="card">
        <div className="card-title">ChildPannel Settings</div>
        <div className="card-body">
          <form>
            {/* Maintenance Mode Switch */}
            <div className="form-check form-switch my-3">
              <input
                className="form-check-input d-block"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
              />
              <label htmlFor="flexSwitchCheckDefault">ChildPannel Status</label>
            </div>

            {/* Website Name */}
            <div className="form-group mb-3">
              <label htmlFor="websiteName">ChildPannel Rate</label>
              <input
                type="number"
                className="form-control"
                id="websiteName"
                placeholder="Enter Price Of Child Pannel"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-main my-3">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChildPannelSettings;
