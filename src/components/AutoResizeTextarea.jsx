import React, { useEffect, useRef } from "react";

const AutoResizeTextarea = ({
  value,
  onChange,
  className,
  style,
  placeholder,
  isNumber = false,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      rows={1}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none resize-none overflow-hidden block ${className}`}
      style={style}
      onKeyDown={(e) => {
        if (isNumber && e.key === "Enter") e.preventDefault();
      }}
    />
  );
};

export default AutoResizeTextarea;
