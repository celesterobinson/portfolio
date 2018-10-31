import React, { Component } from "react";
import "../../styles/Homepage.css";
import Navbar from "../../Navbar/index.js";


export default class Homepage extends Component {
    componentDidMount() {
        const script = document.createElement("script");

        script.src = "//assets.adobedtm.com/staging/launch-EN329a0eb01cc7428da8d2487a6692d5a1-development.min.js";
        script.async = true;

        document.body.appendChild(script);
    }

    render() {
        return (
            <div>
                <Navbar />
                <div className="homepage" id="home">
                    <h2>Hey. Thanks for visiting. I'm</h2>
                    <h1 className="name">C&eacute;leste Robinson</h1>
                    <h2>Web developer, gamer, and Harry Potter addict.</h2>
                </div>
            </div>
        )
    }
}
