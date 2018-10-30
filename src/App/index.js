import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Homepage from "./routes/Homepage";
import About from "./routes/About";
import Projects from "./routes/Projects";
import Info from "./routes/Info";
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
            <div className="app-wrapper">
                <Switch>
                    <Route exact path="/" component={Homepage} />
                    <Route path="/about" component={About} />
                    <Route path="/projects" component={Projects} />
                    <Route path="/info" component={Info} />
                </Switch>
            </div>
        )
    }
}

export default App;