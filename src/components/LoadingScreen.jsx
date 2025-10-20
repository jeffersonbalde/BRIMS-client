import { useState, useEffect } from "react";
import Logo from "../assets/images/logo.png";
import TextLogo from "../assets/images/logo2.png";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress from 0-100% over 5 seconds
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Update step states based on progress
  const step1Active = progress >= 0;
  const step2Active = progress >= 33;
  const step3Active = progress >= 66;

  return (
    <div className="loading-container">
      <div className="loading-wrapper">
        
        {/* Logo Section - Same as Login */}
        <div className="logo-container">
          <div className="logo-wrapper">
            {/* Left: Logo Image */}
            <div className="logo-image">
              <img
                src={Logo}
                alt="Barangay Logo"
                className="logo-img"
              />
            </div>

            {/* Right: Text Logo + Description */}
            <div className="text-logo-section">
              <img
                src={TextLogo}
                alt="System Text Logo"
                className="text-logo-img"
              />
              <p className="system-description">
                BARANGAY REAL-TIME INCIDENT MONITORING SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="circular-progress">
          <div className="circle">
            <div 
              className="circle-fill" 
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
                borderTopColor: progress === 100 ? '#4CAF50' : '#2d5a27'
              }}
            ></div>
            <div className="circle-mask"></div>
          </div>
          <div className="progress-text">
            <span className="percentage">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Status with Steps - Dynamic based on progress */}
        <div className="loading-status">
          <div className="status-steps">
            <div className={`step step-1 ${step1Active ? 'active' : ''}`}>
              <span className="step-icon">{step1Active ? '✓' : '⋯'}</span>
              <span className="step-text">Loading Application</span>
            </div>
            <div className={`step step-2 ${step2Active ? 'active' : ''}`}>
              <span className="step-icon">{step2Active ? '✓' : step1Active ? '⟳' : '⋯'}</span>
              <span className="step-text">Initializing Services</span>
            </div>
            <div className={`step step-3 ${step3Active ? 'active' : ''}`}>
              <span className="step-icon">{step3Active ? (progress === 100 ? '✓' : '⟳') : '⋯'}</span>
              <span className="step-text">Ready to Launch</span>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="welcome-message">
          <p>Welcome to BRIMS - Empowering Barangay Communities</p>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-icon floating-1">🏠</div>
          <div className="floating-icon floating-2">📊</div>
          <div className="floating-icon floating-3">🚨</div>
          <div className="floating-icon floating-4">👥</div>
          <div className="floating-icon floating-5">🌐</div>
          <div className="floating-icon floating-6">🛡️</div>
        </div>

      </div>

      <style jsx>{`
        .loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f8fff9 0%, #e8f0ec 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        .loading-wrapper {
          text-align: center;
          max-width: 500px;
          padding: 3rem 2rem;
          position: relative;
        }

        /* Logo Section - Same styling as Login */
        .logo-container {
          margin-bottom: 2.5rem;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          gap: 0.3rem;
          width: fit-content;
        }

        .logo-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85px;
        }

        .logo-img {
          width: 100px;
          height: 100px;
          object-fit: contain;
          animation: logoGlow 3s ease-in-out infinite;
        }

        .text-logo-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          width: 150px;
        }

        .text-logo-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          margin-bottom: 0.2rem;
          animation: textReveal 1s ease-out 0.5s forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .system-description {
          font-weight: bolder;
          text-align: start;
          font-size: 9px;
          color: #2d5a27;
          margin: 0;
          line-height: 1.2;
          animation: fadeInUp 1s ease-out 0.8s forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        /* Circular Progress */
        .circular-progress {
          width: 100px;
          height: 100px;
          margin: 0 auto 1.5rem;
          position: relative;
        }

        .circle {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .circle-fill {
          width: 100%;
          height: 100%;
          border: 3px solid #e8f0ec;
          border-top: 3px solid #2d5a27;
          border-radius: 50%;
          transition: transform 0.3s ease, border-top-color 0.3s ease;
        }

        .circle-mask {
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .percentage {
          font-size: 0.8rem;
          font-weight: 600;
          color: #2d5a27;
          transition: color 0.3s ease;
        }

        /* Loading Status with Steps */
        .loading-status {
          margin-bottom: 1.5rem;
        }

        .status-steps {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          align-items: center;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          opacity: 0.5;
        }

        .step.active {
          opacity: 1;
          background: rgba(45, 90, 39, 0.1);
          border: 1px solid rgba(45, 90, 39, 0.2);
        }

        .step-icon {
          width: 20px;
          height: 20px;
          background: #2d5a27;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .step-text {
          font-size: 0.85rem;
          color: #2d5a27;
          font-weight: 500;
        }

        /* Welcome Message */
        .welcome-message {
          margin-top: 1rem;
        }

        .welcome-message p {
          font-size: 0.8rem;
          color: #8e9a9d;
          font-weight: 500;
          font-style: italic;
          margin: 0;
          animation: fadeIn 1s ease-out 1.5s forwards;
          opacity: 0;
        }

        /* Floating Elements */
        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .floating-icon {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.09;
          animation: float 6s ease-in-out infinite;
        }

        .floating-1 { top: 10%; left: 5%; animation-delay: 0s; }
        .floating-2 { top: 15%; right: 8%; animation-delay: 1s; }
        .floating-3 { bottom: 25%; left: 8%; animation-delay: 2s; }
        .floating-4 { bottom: 12%; right: 6%; animation-delay: 3s; }
        .floating-5 { top: 35%; left: 12%; animation-delay: 1.5s; }
        .floating-6 { top: 28%; right: 12%; animation-delay: 2.5s; }

        /* Animations */
        @keyframes logoGlow {
          0%, 100% { 
            filter: drop-shadow(0 4px 12px rgba(45, 90, 39, 0.1));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 6px 20px rgba(45, 90, 39, 0.2));
            transform: scale(1.05);
          }
        }

        @keyframes textReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .loading-wrapper {
            padding: 2rem 1rem;
            max-width: 90%;
          }

          .logo-wrapper {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .text-logo-section {
            align-items: center;
            width: 200px;
          }

          .system-description {
            text-align: center;
          }

          .logo-img {
            width: 80px;
            height: 80px;
          }

          .circular-progress {
            width: 80px;
            height: 80px;
          }

          .step {
            padding: 0.4rem 0.8rem;
          }

          .step-text {
            font-size: 0.8rem;
          }

          .welcome-message p {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .logo-img {
            width: 70px;
            height: 70px;
          }

          .text-logo-section {
            width: 180px;
          }

          .system-description {
            font-size: 8px;
          }

          .status-steps {
            gap: 0.5rem;
          }

          .floating-icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}