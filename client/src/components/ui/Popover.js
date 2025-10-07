import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PopoverContext = createContext();

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ children, asChild = false, ...props }, ref) => {
  const { setIsOpen } = useContext(PopoverContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        setIsOpen(true);
      },
      ...props
    });
  }
  
  return (
    <button
      ref={ref}
      onClick={() => setIsOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ children, className, align = 'center', ...props }, ref) => {
  const { isOpen, setIsOpen } = useContext(PopoverContext);
  const popoverRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={(node) => {
        popoverRef.current = node;
        if (ref) ref.current = node;
      }}
      className={`absolute z-50 w-72 rounded-md border bg-white p-4 shadow-md ${className || ''}`}
      style={{
        top: '100%',
        left: align === 'start' ? '0' : align === 'end' ? '100%' : '50%',
        transform: align === 'center' ? 'translateX(-50%)' : 'none',
        marginTop: '0.5rem'
      }}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };