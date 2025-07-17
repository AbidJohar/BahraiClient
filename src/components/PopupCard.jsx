import React from "react";

const PopupCard = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="w-full fixed inset-x-28 bg-transparent   flex justify-center items-center z-50">
      <div className="bg-gray-200 w-1/3  px-6 py-10 rounded-2xl shadow-xl shadow-black/40 ">
        <h2 className="text-lg font-semibold mb-4 text-center">Confirm Deletion</h2>
        <p className="text-gray-600 text-sm text-center mb-6">Are you sure you want to delete this property </p>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupCard;
