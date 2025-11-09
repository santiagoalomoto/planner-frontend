import React from "react";

export default function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-100">
      {title && <h2 className="text-lg font-semibold mb-3 text-gray-700">{title}</h2>}
      {children}
    </div>
  );
}
