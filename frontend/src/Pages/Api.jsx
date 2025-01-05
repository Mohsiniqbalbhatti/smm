import React from "react";
import { useSiteSettings } from "../context/SiteSettingsProvider";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Helmet } from "react-helmet"; // Import Helmet for SEO

function Api() {
  const { siteSettings } = useSiteSettings();

  return (
    <div>
      <div className="container-fluid mt-2">
        <Helmet>
          <title>API Documentation | {siteSettings?.domainName}</title>
          <meta
            name="description"
            content={`Learn how to use the ${siteSettings?.domainName} API to access and automate services. Comprehensive API documentation to guide developers.`}
          />
          <meta
            name="keywords"
            content="API, API documentation, developer guide, automate services, API integration, SMM API"
          />
          <meta
            property="og:title"
            content={`API Documentation | ${siteSettings?.domainName}`}
          />
          <meta
            property="og:description"
            content={`Discover the ${siteSettings?.domainName} API for seamless integration and automation of services. Find detailed documentation and examples.`}
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`https://${siteSettings?.domainName}/api`}
          />
        </Helmet>

        <div className="row">
          <div className="col-12">
            <h3>Api</h3>
            <div className="row d-flex justify-content-between ">
              <div className="col-md col-12 bg-300 my-2 my-md-0 rounded p-2 me-2">
                <div className=" d-flex justify-content-between px-4">
                  HTTP Method <span className="fw-normal">Post</span>
                </div>
              </div>
              <div className="col-md col-12 my-2 my-md-0 bg-300 rounded p-2">
                <div className=" d-flex justify-content-between px-4">
                  <span className="fw-normal">
                    {" "}
                    https://{siteSettings?.domainName}/api/v2
                  </span>
                </div>
              </div>
            </div>
            <div className="row d-flex justify-content-between my-2">
              <div className="col-md col-12 bg-300 my-2 my-md-0 bg-300 rounded p-2 me-2">
                <div className=" d-flex justify-content-between px-4">
                  Api Key{" "}
                  <Link className="fw-normal" to="/profile">
                    Click Here
                  </Link>
                </div>
              </div>
              <div className="col-md col-12 bg-300 my-2 my-md-0 bg-300 rounded p-2">
                <div className=" d-flex justify-content-between px-4">
                  Response Format <span>JSON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Service List</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your Api Key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>Service</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"}
                    <br />
                    "order": 23501
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Add Order</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>add</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Service</td>
                      <td>Service ID</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Link</td>
                      <td>Link to page</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Quantity</td>
                      <td>Needed quantity</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Runs (optional)</td>
                      <td>Runs to deliver</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Interval (optional)</td>
                      <td>Interval in minutes</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"["}
                    <br />
                    {"{"}
                    <br />
                    "service": 1,
                    <br />
                    "name": "Followers",
                    <br />
                    "type": "Default",
                    <br />
                    "category": "First Category",
                    <br />
                    "rate": "0.90",
                    <br />
                    "min": "50",
                    <br />
                    "max": "10000"
                    <br />
                    {"},"}
                    <br />
                    {"{"}
                    <br />
                    "service": 2,
                    <br />
                    "name": "Comments",
                    <br />
                    "type": "Custom Comments",
                    <br />
                    "category": "Second Category",
                    <br />
                    "rate": "8",
                    <br />
                    "min": "10",
                    <br />
                    "max": "1500"
                    <br />
                    {"}"}
                    <br />
                    {"]"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Order Status</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>status</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">order</td>
                      <td>Order ID</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"}
                    <br />
                    "charge": "0.27819",
                    <br /> "start_count": "3572", <br />
                    "status": "Partial", <br />
                    "remains": "157",
                    <br /> "currency": "USD"
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Multiple Order Status</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>status</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">order</td>
                      <td>Multiple Order IDs seperated by comma</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"} <br />
                    "1": {"}"}
                    <br />
                    "charge": "0.27819",
                    <br />
                    "start_count": "3572",
                    <br />
                    "status": "Partial",
                    <br />
                    "remains": "157",
                    <br />
                    "currency": "USD"
                    <br />
                    {"}"}
                    <br />
                    "10": {"{"}"<br />
                    "error": "Incorrect order ID"
                    <br />
                    {"}"}
                    <br />
                    "100": {"{"}"<br />
                    "charge": "1.44219",
                    <br />
                    "start_count": "234",
                    <br />
                    "status": "In progress",
                    <br />
                    "remains": "10",
                    <br />
                    "currency": "USD"
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Create Refill</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>refill</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">order</td>
                      <td>Order ID</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"}
                    <br />
                    "charge": "0.27819",
                    <br /> "start_count": "3572", <br />
                    "status": "Partial", <br />
                    "remains": "157",
                    <br /> "currency": "USD"
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>Refill Status</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>refill_status</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">refill</td>
                      <td>refill ID</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"} <br />
                    "status": "Completed"
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row my-3">
          <div className="col-12 card p-3">
            <h5>User Balance</h5>
            <div className="row">
              <div className="col-12">
                <table class="table custom-table3 border ">
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Key</td>
                      <td>Your API key</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Action</td>
                      <td>balance</td>
                    </tr>
                  </tbody>
                </table>{" "}
              </div>
              <div className="col-12">
                <h5>Example Response</h5>
                <div className="bg-200 p-3 rounded text-danger fw-semibold">
                  <p>
                    {"{"} <br />
                    "balance": 10000,
                    <br /> "currency": "USD",
                    <br />
                    {"}"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <button className="btn btn-main my-3">
              Example of Node Js Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Api;
