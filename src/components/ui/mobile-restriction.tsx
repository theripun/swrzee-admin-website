import React from 'react';

const MobileRestriction = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-4">
      <div className="border-2 border-gray-300 rounded-lg p-6 max-w-sm w-full text-center">
        <p className="text-gray-800 text-lg font-medium">
          Restricted, Please view on desktop
        </p>
      </div>
    </div>
  );
};

export default MobileRestriction; 