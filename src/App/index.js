import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Homepage from "./routes/Homepage/index.js";
import About from "./routes/About";
import Projects from "./routes/Projects";
import Info from "./routes/Info";
import "./styles/App.css";

window.dataLayer = window.dataLayer || [];

export default class App extends Component {
    // constructor(props) {
    //     super(props);
    //     this.setState = {
    //         scrolled: false
    //     }
    // }

    render() {
        //let red = check for boolean value scrolling ? "red" : ""
        return (
            <div className="app-wrapper">
                <Switch>
                    <Route exact path="/" component={Info} />
                    <Route path="/about" component={About} />
                    <Route path="/projects" component={Projects} />
                    <Route path="/home" component={Homepage} />
                </Switch>
            </div>
        )
    }
}