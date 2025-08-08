import React from "react";

const TextField = (props) => {
  const { 
    label, 
    id, 
    placeholder, 
    required = false, 
    extra = "", 
    onChange, 
    value, 
    disabled = false,
    rows = 4,
    className = ""
  } = props;

  return (
    <div className={`${extra}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm text-navy-700 dark:text-white ml-3 font-bold"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        className={`mt-2 flex w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none border-gray-200 dark:!border-white/10 dark:text-white ${className}`}
      />
    </div>
  );
};

export default TextField; 