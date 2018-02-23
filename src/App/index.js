import React from "react";
import { Switch, Route } from "react-router-dom";
import Homepage from "./routes/Homepage";
import About from "./routes/About";
import Projects from "./routes/Projects";
import "./styles/App.css";

function App(props) {
    return (
        <div className="app-wrapper">
            <Switch>
                <Route exact path="/" component={Homepage} />
                <Route path="/about" component={About} />
                <Route path="/projects" component={Projects} />
            </Switch>
        </div>
    )
}

export default App;