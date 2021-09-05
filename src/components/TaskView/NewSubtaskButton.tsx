import { useState, useEffect, useRef } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type NewSubtaskButtonProps = {
  onAdd: (title: string, taskId?: string) => void;
  taskId: string;
  placeholder?: string;
};

const NewSubtaskButton: React.FC<NewSubtaskButtonProps> = props => {
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
      props.onAdd(newValue, props.taskId);
    }
  };

  return (
    <div className="relative mt-2">
      <div
        role="button"
        className="px-2 py-1 bg-white rounded-md shadow-md flex justify-center items-center text-sm space-x-4 border-dashed border-2"
        onClick={() => {
          setShowInp(true);
          setTimeout(() => {
            inpRef.current.focus();
          }, 100);
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Add new subtask</span>
      </div>
      <AnimatePresence initial={false}>
        {showInp && (
          <motion.div
            key="add-new-task-inp"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute right-0 top-8 w-full bg-gray-600 px-2 pt-1 pb-2 rounded-md shadow-md"
          >
            <div className="flex justify-end">
              <div
                role="button"
                title="Close"
                style={{ width: "min-content" }}
                className="p-1 text-xl text-white"
                onClick={() => {
                  setShowInp(false);
                  handleCompleteAdd();
                }}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className="rotate-45 transform"
                />
              </div>
            </div>
            <input
              placeholder={props.placeholder || "Enter text"}
              className="p-2 outline-none border-gray-800 rounded-md shadow-md text-black w-full"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewSubtaskButton;
