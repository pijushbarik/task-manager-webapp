import { useContext, createContext, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {}

const socketContext = createContext<Socket | null>(null);

const SocketProvider: React.FC<SocketProviderProps> = props => {
  const socket = useSocketProvider();

  return (
    <socketContext.Provider value={socket}>
      {props.children}
    </socketContext.Provider>
  );
};

const useSocket = () => {
  const context = useContext(socketContext);
  if (!context) {
    throw new Error("useSocket must be used in a SocketProvider");
  }
  return context;
};

const useSocketProvider = () => {
  const [socket] = useState<Socket | null>(() =>
    io(process.env.REACT_APP_API_URL || "")
  );

  return socket;
};

export default useSocket;
export { SocketProvider };
