import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import React from "react";

interface ButtonProps {
  icon?: IconDefinition;
  primary?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: () => void;
  size?: "small" | "default";
}

const Button: React.FC<ButtonProps> = props => {
  return (
    <button
      title={props.title}
      className={classNames(
        "flex items-center space-x-2 p-1 rounded-sm shadow-md transition border",
        props.size === "small" ? "text-sm" : "text-base",
        props.primary && "bg-red-500 border border-red-500 text-white",
        !props.children &&
          props.icon &&
          "hover:bg-gray-100 rounded-full shadow-none border-none p-2",
        props.className
      )}
      style={props.style || {}}
      onClick={props.onClick}
    >
      {props.icon ? <FontAwesomeIcon icon={props.icon} /> : null}
      {props.children ? <span>{props.children}</span> : null}
    </button>
  );
};

export default Button;
