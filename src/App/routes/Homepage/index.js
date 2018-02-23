import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/Homepage.css";

class Homepage extends Component {
    componentDidMount() {

    }

    render() {
        return (
            <div className="homepage">
                <h1 className="name">C&eacute;leste Robinson</h1>
                <div className="nav-buttons">
                    <Link to="/about">
                        <div className="enter">
                            <h3>ABOUT</h3>
                        </div>
                    </Link>
                    <Link to="/projects">
                        <div className="projects-button">
                            <h3>PROJECTS</h3>
                        </div>
                    </Link>
                </div>
            </div>
        )
    }
}

export default Homepage;
