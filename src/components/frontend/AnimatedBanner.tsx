"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Assuming they might use next/image
// If they don't have next/image configured for this, they can replace with standard <img>

export default function AnimatedBanner() {
  return (
    <section className="py-5 bg-light overflow-hidden">
      <div className="container">
        <div className="row align-items-center min-vh-50">
          
          {/* Text Content with Scroll Animation */}
          <motion.div 
            className="col-lg-6 mb-4 mb-lg-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h1 className="display-4 fw-bold mb-3">
              Discover Our New Model
            </h1>
            <p className="lead text-muted mb-4">
              This text elegantly animates from the side as you scroll down the page, providing a premium feel to your application.
            </p>
            <button className="btn btn-primary btn-lg">
              Learn More
            </button>
          </motion.div>

          {/* Model / Image with Scroll Animation */}
          <motion.div 
            className="col-lg-6 position-relative text-center"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            {/* You can replace this div with your actual 3D model canvas or an Image */}
            <div className="bg-white rounded-circle shadow p-5 mx-auto d-flex align-items-center justify-content-center" style={{ width: '300px', height: '300px' }}>
               <h4 className="text-secondary m-0">Your Model / Image Here</h4>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
