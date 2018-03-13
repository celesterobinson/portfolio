import React, { Component } from 'react'
import Navbar from "../../Navbar";
import headshot from "../../images/headshot.JPG";

import "../../styles/About.css";

class About extends Component {
    render() {
        return (
            <div style={{ color: "white" }} className="about-wrapper">
                <Navbar />
                <div className="about-details" id="about">
                    <img src={headshot} alt="Celeste Robinson" />
                    <div className="about-text">
                        <h2>Bio</h2>
                        <p>
                            I have recently discovered a love of programming and technology and the limitless potential it has. I believe technology, and those who create it, have the tools at their fingertips (literally) to make a major impact on the world. My goal is to expand and use my programming skills to create new ways to share knowledge, and enhance the world around me. The main projects in this portfolio take issues I have seen in my own life, and attempt to correct them. Proficient in HTML, CSS, JavaScript, jQuery, React/Redux, Node.js, Express, MongoDB, and git.
                        </p>
                        <h2>Extras</h2>
                        <p>
                            My husband and I are both professional trumpet players, and can often be found performing all over Utah. I'm an avid Harry Potter lover, Skyrim lover, Overwatch lover, and dog lover. I'm also a Hufflepuff.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default About;
