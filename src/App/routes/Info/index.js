import React, { Component } from 'react';
import logo from '../../../logo.svg';
import '../../styles/Info.css';

export default class Info extends Component {

    componentDidMount() {
        const script = document.createElement("script");

        script.src = "//assets.adobedtm.com/staging/launch-EN7f97a37873ab48a990b1848cefe1f58d-development.min.js";
        script.async = true;

        document.body.appendChild(script);
    }

    render() {
        return (
            <div className="Info">
                <header className="Info-header">
                    <img src={logo} className="Info-logo" alt="logo" />
                    <p>
                        This page could be yours.
                    </p>
                    <p>Click<a
                        className="Info-link"
                        id="conversionLink"
                        href="https://www.cececodes.com/home"
                    > here</a> for a free consultation, <br/>and get your website started TODAY!</p>
                </header>
                <footer>
                    <div>Icons made by <a href="https://www.flaticon.com/authors/vitaly-gorbachev" title="Vitaly Gorbachev">Vitaly Gorbachev</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a></div>
                </footer>
            </div>
        );
    }
}