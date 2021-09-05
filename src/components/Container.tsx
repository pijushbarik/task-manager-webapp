import classNames from "classnames";

type ContainerProps = {
  fluid?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

const Container: React.FC<ContainerProps> = props => {
  return (
    <div
      className={classNames(
        "relative",
        props.fluid ? "w-11/12 max-w-screen-2xl mx-auto" : "w-full",
        props.className
      )}
      style={props.style || {}}
    >
      {props.children}
    </div>
  );
};

export default Container;
