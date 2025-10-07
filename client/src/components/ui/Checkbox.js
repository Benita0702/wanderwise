import React, { useState } from 'react';

const Checkbox = React.forwardRef(({ id, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = useState(checked || false);
  
  const isChecked = checked !== undefined ? checked : internalChecked;
  const setIsChecked = onCheckedChange || setInternalChecked;
  
  return (
    <div className="flex items-center">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };