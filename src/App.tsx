import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Board from "./pages/Board";
import Home from "./pages/Home";
import { SocketProvider } from "./lib/hooks/useSocket";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Layout>
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/board" component={Board} />
          </Switch>
        </Layout>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
