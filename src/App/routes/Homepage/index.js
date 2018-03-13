import React, { Component } from "react";
import "../../styles/Homepage.css";

class Homepage extends Component {
    componentDidMount() {

    }

    render() {
        return (
            <div className="homepage" id="home">
                <h2>Hey. Thanks for visiting. I'm</h2>
                <h1 className="name">C&eacute;leste Robinson</h1>
                <h2>Web developer, gamer, and Harry Potter addict.</h2>
            </div>
        )
    }
}

export default Homepage;