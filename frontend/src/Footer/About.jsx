import React from "react";
import "./About.css";

import heroImg from "../assets/photo/2.jpeg";
import promiseImg from "../assets/photo/1.jpeg";
import professionalImg from "../assets/photo/3.jpeg";
import solutionImg from "../assets/photo/4.jpeg";
import crueltyImg from "../assets/photo/5.png";
import { motion } from "framer-motion";
import logoIcon from "../assets/logo.png";
const pillars = [
  {
    title: "Promise",
    image: promiseImg,
    text: `No maybe. No if.

12-hour wear, promised.
True tone on Indian skin, promised.
Comfort first, promised.

If we can't test it, we don't claim it.
Trust earned in hours, not headlines.`
  },
  {
    title: "Professional",
    image: professionalImg,
    text: `Formulated by chemists. Perfected by real women.

Pro-grade textures, pigments, performance.

Because your 9-to-9 deserves makeup that doesn't quit.

No patchy pay-off.
No mid-day meltdown.`
  },
  {
    title: "Solution-Based",
    image: solutionImg,
    text: `We don't launch products.
We launch answers.

For humidity that melts mattes.
For bases that oxidize.
For blush that vanishes.

Cosmetics re-engineered for all skin types in all weathers.`
  },
  {
    title: "Cruelty-Free Soul",
    image: crueltyImg,
    text: `100% vegan.
100% cruelty-free. Always.

Tested on all skin tones of all ages.
Never on animals.

A clear conscience wears better than any highlighter.`
  }
];

const About = () => {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="hero">
        <img src={heroImg} alt="Hogaa" />
        <div className="overlay"></div>

        <div className="hero-content">
           <img  style={{height:'80%',width:'80%',resize:'contain',objectFit:'contain'}} src={logoIcon} alt="hogaa Cosmetics"  />
          {/* <h1>HOGAA</h1> */}
          <p>Colour | Care | Solutions | Promise</p>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="brand-story" data-aos="fade-up">
        <span style={{marginBottom:50}}>OUR BRAND STORY</span>

        <h2 style={{marginTop:30}}>Hogaa Cosmetics
    <br></br>
    <p style={{fontSize:'2rem',textTransform:'capitalize',color:'#fbaf17',letterSpacing:'5px'}}>
For every Face | For every Age | For You</p></h2>

        <p>
          Born in colour cosmetics and building on Face and Skin.
        </p>

        <p>
          We are Hogaa Cosmetics: Premium, Professional, and rooted in Solutions.
        </p>

        <p>
          Because beauty isn't one-size, your Face and Skin have a story and
          specific needs. They need care with optimised solutions.
        </p>
       
        <h3 style={{fontSize:'2.5rem',marginTop:30}}>Every Hogaa product starts as a solution.
    <br></br>
    <p style={{fontSize:'1.5rem',textTransform:'capitalize',color:'#fbaf17',letterSpacing:'5px'}}>
 For texture | For tone | For time</p></h3>

        {/* <div className="story-highlight">
          <h3></h3>

          <ul>
            <li></li>
            <li>For tone.</li>
            <li>For time.</li>
          </ul>

          <p>Tested by professionals. Made for real skin.</p>
        </div> */}

        {/* <div className="story-highlight">
          <h3>Every solution ends with a Promise.</h3>

          <ul>
            <li>12-hour wear, promised.</li>
            <li>True tone, promised.</li>
            <li>Comfort first, promised.</li>
          </ul>
        </div> */}
  <h3 style={{fontSize:'2.5rem',marginTop:30}}>Every solution ends with a Promise.
    <br></br>
    <p style={{fontSize:'1.5rem',textTransform:'capitalize',color:'#fbaf17',letterSpacing:'5px'}}>
12-hour wear promised | True tone promised | Comfort first promised</p></h3>
        {/* <blockquote>
          New brand. Old belief.
          <br />
          Makeup should work as hard as you do.
        </blockquote> */}
      </section>

      {/* PILLARS */}
      <section className="pillars">
        <h2>Our Core Pillars</h2>

        <div className="pillar-grid">
          {pillars.map((pillar, index) => (
            <motion.div
  className="pillar-card"
  whileHover={{
    y: -10,
    scale: 1.02
  }}
>
              <img src={pillar.image} alt={pillar.title} />

              <h3>{pillar.title}</h3>

              <p>{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="philosophy">
        <h2>Every Face Has A Story</h2>

        <p>
          Beauty isn't one-size.
          <br />
          Every face is different.
          <br />
          Every skin journey is different.
        </p>

        <p>
          That's why every Hogaa product begins with a solution
          and ends with a promise.
        </p>
      </section>

      {/* FOOTER */}
      <section className="signature">
        <h2>HOGAA COSMETICS</h2>

        <p>Colour. Care. Solutions. Promise.</p>

        <span>For Every Face | For Every Age | For You</span>
      </section>

    </div>
  );
};

export default About;