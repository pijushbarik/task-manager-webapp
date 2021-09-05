import Navbar from "./Navbar";
import Container from "../Container";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = props => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main
        style={{ minHeight: "calc(100vh - 72px - 32px)" }}
        className="bg-gray-100"
      >
        <Container fluid className="h-full">
          {props.children}
        </Container>
      </main>
      <footer className="bg-gray-100 py-2">
        <Container fluid>
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()}. Task Manager.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
