import React from "react";

const DynamicContentRenderer = ({ data }) => {
  const renderKeyValue = (key, value) => {
    if (Array.isArray(value)) {
      return (
        <div key={key}>
          <strong>{key}:</strong>
          <ul className="ml-4">
            {value.map((item, index) => (
              <li key={index}>
                {/* If item is an object, render each key-value pair */}
                {typeof item === "object" ? (
                  <ul>
                    {Object.keys(item).map((nestedKey) => (
                      <li key={nestedKey}>
                        <strong>{nestedKey}:</strong> {item[nestedKey]}
                      </li>
                    ))}
                  </ul>
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (value && typeof value === "object") {
      // For nested objects (e.g., payment method details)
      return (
        <div key={key}>
          <strong>{key}:</strong>
          <ul className="ml-4">
            {Object.keys(value).map((nestedKey) => (
              <li key={nestedKey}>
                <strong>{nestedKey}:</strong> {value[nestedKey]}
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (value === null) {
      return (
        <div key={key}>
          <strong>{key}:</strong> <em>No data available</em>
        </div>
      );
    } else {
      return (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      );
    }
  };

  return (
    <div className="prose max-w-full">
      <div className="bg-gray-100 p-4 rounded-lg">
        
        {Object.keys(data).map((key) => renderKeyValue(key, data[key]))}
      </div>
    </div>
  );
};

export default DynamicContentRenderer;
