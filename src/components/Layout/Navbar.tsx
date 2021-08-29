import React from "react";
import { NavLink } from "react-router-dom";
import Container from "../Container";

const Navbar: React.FC = () => (
  <nav className="bg-gray-900">
    <Container fluid className="py-4 flex justify-between items-center">
      <NavLink to="/" className="text-4xl font-semibold text-white">
        Task Manager
      </NavLink>
      <ul className="flex items-center space-x-4 text-white">
        <li>
          <NavLink
            to="/"
            className="px-4 py-2 rounded-sm hover:bg-red-200 hover:text-black transition"
            activeClassName="bg-red-200 text-black"
            exact
          >
            Work Items
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/board"
            className="px-4 py-2 rounded-sm hover:bg-red-200 hover:text-black transition"
            activeClassName="bg-red-200 text-black"
          >
            Board
          </NavLink>
        </li>
      </ul>
    </Container>
  </nav>
);

export default Navbar;
