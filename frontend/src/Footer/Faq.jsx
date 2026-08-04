import React, { useState } from 'react';
import { 
  Tag, Truck, RotateCcw, User, Info, XCircle 
} from 'lucide-react';
import './Faq.css';

const faqData = [
  {
    category: "GENERAL",
    icon: <Info size={18} />,
    questions: [
      { q: "I am having trouble accessing the site?", a: "Please clear your browser cache or check your connection. Our site works best on updated versions of Chrome and Safari." },
      { q: "Where can I purchase hogaa products?", a: "You can purchase our premium beauty products exclusively on our official website." },
      { q: "How do I use hogaa products?", a: "Each product page has a dedicated 'How to Use' section with step-by-step instructions." },
      { q: "What types of ingredients are used in hogaa products?", a: "We use high-quality, dermatologically tested ingredients. Full lists are available on each product page." },
      { q: "Does hogaa test on animals?", a: "No, hogaa is a 100% cruelty-free brand." }
    ]
  },
  {
    category: "SHIPPING",
    icon: <Truck size={18} />,
    questions: [
      { q: "What is the estimated time of delivery?", a: "Standard delivery takes 3-5 business days." },
      { q: "Are there any shipping charges applicable on my order?", a: "Shipping is free for orders above ₹1500. Below that, a flat fee of ₹99 applies." },
      { q: "Where can I track my order?", a: "You will receive a tracking ID via SMS and Email once your order is dispatched." }
    ]
  },
  {
    category: "PROMO",
    icon: <Tag size={18} />,
    questions: [
      { q: "What are the Terms & Conditions for the GWP?", a: "Gift With Purchase is valid until stocks last and only on participating products." },
      { q: "What are the Terms & Conditions for the coupon code SWEET500?", a: "Apply SWEET500 on checkout for ₹500 off on your first order above ₹1999." },
      { q: "What are the T&C for Triple Treat Offer?", a: "Buy 2 and get the 3rd item (lowest value) for free." }
    ]
  }
  // Aap isi tarah baki categories (Cancellation, Returns, Account) bhi add kar sakte hain...
];

const renderWithhogaa = (text) =>
  text.split('hogaa').reduce((acc, part, i) => {
    if (i === 0) return [part];
    return [...acc, <span key={i} className="hogaa-font">hogaa</span>, part];
  }, []);

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    // Agar wahi question dubara click ho toh band (null) kar do, warna naya index set karo
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="hogaa-policy-container">
      <header className="policy-header">
        <p className="last-updated">NEED HELP?</p>
        <h1>FREQUENTLY ASKED QUESTIONS</h1>
      </header>

      <div className="policy-content-wrapper">
        {faqData.map((section, sIdx) => (
          <div key={sIdx} className="policy-section">
            <h2 className="faq-category-title">
              <span className="cat-icon">{section.icon}</span>
              {section.category}
            </h2>
            <div className="faq-accordion">
              {section.questions.map((item, qIdx) => {
                const combinedIndex = `${sIdx}-${qIdx}`;
                const isOpen = activeIndex === combinedIndex;
                
                return (
                  <div key={qIdx} className={`faq-row-item ${isOpen ? 'active' : ''}`}>
                    <div 
                      className="faq-question-trigger" 
                      onClick={() => toggleAccordion(combinedIndex)}
                    >
                      <span className="q-text">{renderWithhogaa(item.q)}</span>
                      {/* Right side + icon jo click hone par transform hoga */}
                      <span className={`q-plus-icon ${isOpen ? 'rotate' : ''}`}>+</span>
                    </div>
                    
                    {/* Ye div sirf tabhi expand hoga jab isOpen true hoga */}
                    <div className="faq-answer-content">
                      <div className="answer-inner">
                        <p>{renderWithhogaa(item.a)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;