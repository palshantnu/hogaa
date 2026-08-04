import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import "./Contact.css";

const ContactUs = () => {

  useEffect(() => {
    ScrollReveal().reveal(".contact-box", {
      duration: 1000,
      origin: "left",
      distance: "60px",
    });
  }, []);

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>

      <div className="contact-box">
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message"></textarea>
        <button>Send Message</button>
      </div>
    </div>
  );
};

export default ContactUs;