import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoadingAuthentication() {
  const [progress, setProgress] = useState(0);
  const { loading } = useAuth();

  useEffect(() => {
    if (loading) {
      // Simulate authentication progress
      const duration = 3000; // 3 seconds for auth
      const interval = 50;
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
    }
  }, [loading]);

  // Dynamic status text based on progress
  const getStatusText = () => {
    if (progress < 25) return "Starting authentication...";
    if (progress < 50) return "Verifying credentials...";
    if (progress < 75) return "Loading user data...";
    if (progress < 100) return "Finalizing session...";
    return "Authentication complete!";
  };

  return (
    <div className="loading-auth-container">
      {/* Flowing Background */}
      <div className="flowing-background">
        <div className="flow-layer layer-1"></div>
        <div className="flow-layer layer-2"></div>
        <div className="flow-layer layer-3"></div>
      </div>

      {/* Main Content */}
      <div className="loading-auth-content">
        
        {/* Animated Shield Icon */}
        <div className="auth-shield">
          <div className="shield-icon">
            <div className="shield-inner">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="shield-glow"></div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="auth-status">
          <h2 className="auth-title">Securing Your Session</h2>
          <p className="auth-subtitle">Preparing your dashboard experience</p>
        </div>

        {/* Single Progress Indicator */}
        <div className="single-progress">
          <div className="progress-container">
            <div className="progress-circle">
              <div className="circle-background"></div>
              <div 
                className="circle-progress"
                style={{
                  transform: `rotate(${progress * 3.6}deg)`,
                  borderTopColor: progress === 100 ? '#4CAF50' : '#2d5a27',
                  borderRightColor: progress === 100 ? '#4CAF50' : '#2d5a27'
                }}
              ></div>
              <div className="circle-text">
                <span className="percentage">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
          
          <div className="progress-status">
            <span className="status-text">{getStatusText()}</span>
            <div className="status-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Simple Security Note */}
        <div className="security-note">
          <i className="fas fa-lock"></i>
          <span>Your session is being securely authenticated</span>
        </div>

      </div>

      <style jsx>{`
        .loading-auth-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f8fff9 0%, #e8f0ec 50%, #f0f9ff 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* Flowing Background */
        .flowing-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.4;
        }

        .flow-layer {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, #2d5a27, #3a6b32);
          opacity: 0.1;
          animation: float 12s ease-in-out infinite;
        }

        .layer-1 {
          width: 300px;
          height: 300px;
          top: -150px;
          right: -100px;
          animation-delay: 0s;
        }

        .layer-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: -50px;
          animation-delay: 4s;
          background: linear-gradient(45deg, #1f3d1a, #2d5a27);
        }

        .layer-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          right: 10%;
          animation-delay: 8s;
          background: linear-gradient(45deg, #3a6b32, #4a7a42);
        }

        /* Main Content */
        .loading-auth-content {
          text-align: center;
          max-width: 400px;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(45, 90, 39, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(45, 90, 39, 0.1);
          position: relative;
          z-index: 2;
        }

        /* Shield Icon */
        .auth-shield {
          margin-bottom: 2rem;
        }

        .shield-icon {
          position: relative;
          display: inline-block;
        }

        .shield-inner {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #2d5a27, #3a6b32);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          position: relative;
          z-index: 2;
          box-shadow: 0 10px 30px rgba(45, 90, 39, 0.3);
        }

        .shield-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: #2d5a27;
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse 2s ease-in-out infinite;
          z-index: 1;
        }

        /* Authentication Status */
        .auth-status {
          margin-bottom: 2.5rem;
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d5a27;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #2d5a27, #1f3d1a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-subtitle {
          font-size: 1rem;
          color: #6c757d;
          margin: 0;
          font-weight: 500;
        }

        /* Single Progress Indicator */
        .single-progress {
          margin-bottom: 2rem;
        }

        .progress-container {
          margin-bottom: 1.5rem;
        }

        .progress-circle {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto;
        }

        .circle-background {
          width: 100%;
          height: 100%;
          border: 8px solid #f0f0f0;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
        }

        .circle-progress {
          width: 100%;
          height: 100%;
          border: 8px solid transparent;
          border-top: 8px solid #2d5a27;
          border-right: 8px solid #2d5a27;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          transition: transform 0.3s ease, border-top-color 0.3s ease, border-right-color 0.3s ease;
        }

        .circle-text {
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
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d5a27;
          transition: color 0.3s ease;
        }

        .progress-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .status-text {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
          min-height: 1.2em;
          transition: all 0.3s ease;
        }

        .status-dots {
          display: flex;
          gap: 4px;
        }

        .status-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2d5a27;
          animation: dotPulse 1.4s ease-in-out infinite both;
        }

        .status-dots span:nth-child(1) { animation-delay: -0.32s; }
        .status-dots span:nth-child(2) { animation-delay: -0.16s; }
        .status-dots span:nth-child(3) { animation-delay: 0s; }

        /* Security Note */
        .security-note {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.2rem;
          background: rgba(45, 90, 39, 0.08);
          border: 1px solid rgba(45, 90, 39, 0.15);
          border-radius: 12px;
          color: #2d5a27;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .security-note i {
          font-size: 0.8rem;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(120deg);
          }
          66% {
            transform: translateY(8px) rotate(240deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.3;
          }
        }

        @keyframes dotPulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .loading-auth-content {
            padding: 2.5rem 1.5rem;
            margin: 1rem;
            max-width: 90%;
          }

          .auth-title {
            font-size: 1.5rem;
          }

          .shield-inner {
            width: 70px;
            height: 70px;
            font-size: 1.8rem;
          }

          .shield-glow {
            width: 90px;
            height: 90px;
          }

          .progress-circle {
            width: 90px;
            height: 90px;
          }
        }

        @media (max-width: 480px) {
          .loading-auth-content {
            padding: 2rem 1.2rem;
          }

          .auth-title {
            font-size: 1.4rem;
          }

          .auth-subtitle {
            font-size: 0.9rem;
          }

          .security-note {
            font-size: 0.8rem;
            padding: 0.6rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}