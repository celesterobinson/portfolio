import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { HashLink as Link } from 'react-router-hash-link';
import Navbar from "./Navbar";
import Homepage from "./routes/Homepage";
import About from "./routes/About";
import Projects from "./routes/Projects";
import "./styles/App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.setState = {
            scrolled: false
        }
    }

    render() {
    //let red = check for boolean value scrolling ? "red" : ""        
        return (
            <div className={`app-wrapper ${red}`}>
                <Navbar className="scrolled"/>
                <Switch>
                    <Route exact path="/" component={Homepage} />
                    <Route path="/about" component={About} />
                    <Route path="/projects" component={Projects} />
                </Switch>
                <About />
            </div>
        )
    }
}

export default App;