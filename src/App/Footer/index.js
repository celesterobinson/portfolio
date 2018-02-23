import React from 'react';
import Github from "../images/icons/github.png";
import Twitter from "../images/icons/twitter.png";
import Linkedin from "../images/icons/linkedin.png";

//Styles
import "../styles/Footer.css";

function Footer() {
    return (
        <div className="footer">
            <a href="https://twitter.com/cececodes" rel="noopener noreferrer" target="_blank">
                <img src={Twitter} alt="Twitter Link" />
            </a>
            <a href="https://github.com/celesterobinson" rel="noopener noreferrer" target="_blank">
                <img src={Github} alt="Github Link" />
            </a>
            <a href="https://www.linkedin.com/in/celeste-robinson/" rel="noopener noreferrer" target="_blank">
                <img src={Linkedin} alt="LinkedIn Link" />
            </a>
        </div>
    )
}

export default Footer;
