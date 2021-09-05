import { useState, useEffect, useRef } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type FixedNewTaskButonProps = {
  onAdd: (title: string, taskId?: string) => void;
  placeholder?: string;
};

const FixedNewTaskButton: React.FC<FixedNewTaskButonProps> = props => {
  const [showInp, setShowInp] = useState(false);
  const [value, setValue] = useState("");

  const inpRef = useRef<any>();

  useEffect(() => {
    if (showInp) {
      setValue("");
    }
  }, [showInp]);

  const handleCompleteAdd = () => {
    const newValue = value.trim();
    if (newValue) {
      props.onAdd(newValue);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "3.5rem",
        right: "5%",
      }}
    >
      <div
        role="button"
        className="h-14 w-14 flex justify-center items-center rounded-full shadow-lg bg-indigo-900 text-white text-xl"
        title="Add new task"
        onClick={() => {
          setShowInp(true);
          setTimeout(() => {
            inpRef.current.focus();
          }, 100);
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </div>
      <AnimatePresence initial={false}>
        {showInp && (
          <motion.div
            key="add-new-task-inp"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, width: "auto" },
              collapsed: { opacity: 0, width: 0 },
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute bg-white p-2 shadow-lg rounded-full flex justify-between space-x-4 border"
            style={{ right: "-10%", bottom: "-10%" }}
          >
            <input
              placeholder="Enter task title"
              className="outline-none text-black rounded-full text-xl px-4"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setShowInp(false);
                  handleCompleteAdd();
                }
              }}
              onBlur={() => {
                setShowInp(false);
                handleCompleteAdd();
              }}
              ref={inpRef}
            />
            <div
              role="button"
              className="h-14 w-14 flex justify-center items-center rounded-full shadow-lg bg-indigo-900 text-white text-xl"
              title="Close"
              onClick={() => {
                setShowInp(false);
                handleCompleteAdd();
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="rotate-45 transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FixedNewTaskButton;
