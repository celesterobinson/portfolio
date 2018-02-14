import React, { Component } from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";

class Header extends Component {
    render() {
        return (
            <div className="header">
                <h1 className="name">C&eacute;leste Robinson</h1>
                <div className="enter">
                    <h3>ENTER</h3>
                </div>
            </div>
        )
    }
}

export default Header;
