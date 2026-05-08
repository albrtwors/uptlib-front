import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  isRequired?: boolean;
}

const Label: FC<LabelProps> = ({ isRequired = true, htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // User-defined className that can override the default margin
        className
      )}
    >
      {children}

      {isRequired && <span className="font-bold text-red-700"> *</span>}
    </label>
  );
};

export default Label;
