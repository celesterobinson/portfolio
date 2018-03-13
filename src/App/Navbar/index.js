import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';

import "../styles/Navbar.css";

function Navbar() {
    return (
        <div className="navbar">
            <div className="links">
                <Link smooth to="/#home">Home</Link>
                <Link smooth to="/#about">About</Link>
                <Link smooth to="/#projects">Projects</Link>
            </div>
        </div>
    )
}

export default Navbar;