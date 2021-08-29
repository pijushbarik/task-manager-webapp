import TaskView from "../components/TaskView";

const Home: React.FC = () => {
  return (
    <div className="py-10 h-full">
      <TaskView mode="list" />
    </div>
  );
};

export default Home;
