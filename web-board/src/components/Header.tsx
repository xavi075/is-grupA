import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './Header.css';
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/">Sensor Center</Navbar.Brand>
      {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Link className="nav-link" to="/">Inici</Link>
          <Link className="nav-link" to="/data">Dades</Link>
          <Link className="nav-link" to="/parameters">Paràmetres</Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
