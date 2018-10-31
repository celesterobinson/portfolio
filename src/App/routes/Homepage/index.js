import React, { Component } from "react";
import "../../styles/Homepage.css";
import Navbar from "../../Navbar/index.js";


export default class Homepage extends Component {
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
