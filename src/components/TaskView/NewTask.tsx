import { useState, useEffect, useRef } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button";
import { motion, AnimatePresence } from "framer-motion";

type NewTaskProps = {
  onAdd: (title: string, taskId?: string) => void;
  taskId?: string;
  placeholder?: string;
  addText?: string;
  useDefaultButton?: boolean;
};

const NewTask: React.FC<NewTaskProps> = props => {
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
    <div className="relative">
      <Button
        icon={faPlus}
        primary={!props.useDefaultButton}
        size="small"
        onClick={() => {
          setShowInp(true);
          setTimeout(() => {
            inpRef.current.focus();
          }, 100);
        }}
      >
        {props.addText || "Add"}
      </Button>
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
            className="absolute right-0 top-8"
          >
            <input
              placeholder={props.placeholder || "Enter text"}
              className="p-2 outline-none border-gray-800 rounded-sm shadow-md text-black"
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

export default NewTask;
