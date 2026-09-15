import React, { useEffect, useState } from 'react';

interface LandingPageProps {
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPending, setMotionPending] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMotionPending(false);
      return;
    }

    const timer = setTimeout(() => {
      setMotionPending(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleDemoCardAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'entrance-card') {
      setMotionPending(false);
    }
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`vantage-scope ${motionPending ? 'motion-pending' : ''}`}>
      <style>{`
        @font-face {
          font-family: "Reference Sans";
          src: local("Reference Sans"), local("MS Reference Sans Serif"), local("Segoe UI"), local("Arial");
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Reference Display";
          src: local("Reference Display"), local("Reference Sans"), local("Segoe UI Semibold"), local("Arial");
          font-weight: 400 900;
          font-style: normal;
          font-display: swap;
        }

        .vantage-scope {
          font-family: "Reference Sans", Arial, sans-serif;
          color-scheme: dark;
          position: fixed;
          inset: 0;
          isolation: isolate;
          background: #000;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          color: #fff;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;

          --gutter-start: clamp(36px, 4.177vw, 96px);
          --gutter-end: clamp(36px, 4.04vw, 96px);
          --header-top: clamp(20px, 2.264vh, 30px);
          --hero-bottom: clamp(34px, 5.19vh, 64px);
          --display-size: clamp(58px, 7.64vh, 88px);
          --display-leading: clamp(72px, 9.34vh, 106px);
          --copy-size: clamp(14px, 1.70vh, 19px);
          --copy-leading: clamp(19px, 2.17vh, 24px);
          --title-copy-gap: clamp(15px, 2.08vh, 24px);
          --copy-cta-gap: clamp(24px, 3.11vh, 36px);
          --cta-width: clamp(142px, 15.09vh, 168px);
          --cta-height: clamp(38px, 3.96vh, 44px);
          --compact-control-font-size: clamp(17px, 1.75vh, 19px);
          --action-control-font-size: clamp(17px, 1.78vh, 19.5px);
          --primary-control-font-size: clamp(17px, 1.77vh, 19.25px);
          --control-inline-nudge: -1px;
          --control-baseline-shift: clamp(1px, .19vh, 2px);
          --copy-optical-shift: clamp(0px, .1vh, 1px);
          --watch-baseline-shift: clamp(2px, .38vh, 4px);
          --card-width: clamp(150px, 18.96vh, 215px);
        }

        .vantage-scope button, .vantage-scope a {
          font-family: inherit;
          color: inherit;
          text-decoration: none;
          transition: filter 140ms ease, opacity 140ms ease;
        }

        .vantage-scope button:hover, .vantage-scope a:hover {
          filter: brightness(1.08);
        }

        .vantage-scope :focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }

        .vantage-screen {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: #000;
          overflow: hidden;
        }

        .vantage-background {
          position: absolute;
          inset: 0;
          z-index: -3;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          pointer-events: none;
          user-select: none;
        }

        .vantage-screen::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.03), transparent 24%, transparent 82%, rgba(0,0,0,.05)),
            radial-gradient(ellipse at 44% 54%, transparent 30%, rgba(0,0,0,.055) 100%);
        }

        .vantage-header {
          position: absolute;
          inset: var(--header-top) var(--gutter-end) auto var(--gutter-start);
          height: 48px;
          display: flex;
          align-items: flex-start;
          white-space: nowrap;
          z-index: 20;
        }

        .vantage-brand {
          position: relative;
          top: 10px;
          display: inline-flex;
          width: 25px;
          height: 25px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
          flex-shrink: 0;
        }

        .vantage-header-actions {
          display: flex;
          align-items: flex-start;
          width: 100%;
        }

        .vantage-nav {
          display: flex;
          align-items: center;
          margin-left: clamp(36px, 3.03vw, 48px);
          gap: clamp(32px, 2.9vw, 43px);
          position: relative;
          top: 9px;
        }

        .vantage-nav-link {
          font-size: 16px;
          font-weight: 430;
          letter-spacing: -.36px;
          color: rgba(229,229,230,.77);
          text-shadow: 0 1px 3px rgba(0,0,0,.55);
          position: relative;
          cursor: pointer;
        }

        .vantage-nav-link:first-child {
          position: relative;
          top: -3px;
        }

        .vantage-nav-link:last-child {
          margin-left: 1px;
        }

        .vantage-nav-link.active {
          color: #fff;
        }

        .vantage-nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 2px;
          background: rgba(255,255,255,.82);
          border-radius: 1px;
        }

        .vantage-time-panel {
          margin-left: auto;
          width: 211px;
          height: 48px;
          padding-left: 8px;
          border-left: 2px solid rgba(230,230,230,.52);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .vantage-time-label {
          font-size: 15px;
          font-weight: 420;
          color: rgba(240,240,240,.77);
          line-height: 1.15;
        }

        .vantage-time-value {
          font-size: 15px;
          font-weight: 440;
          color: rgba(255,255,255,.93);
          line-height: 1.15;
          margin-top: 3px;
          font-variant-numeric: tabular-nums;
        }

        .vantage-sign-up {
          width: 109px;
          height: 42px;
          border-radius: 7px;
          background: #fff;
          color: #101010;
          font-size: var(--action-control-font-size);
          font-weight: 460;
          letter-spacing: -.34px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.72), 0 1px 5px rgba(0,0,0,.34);
          margin-left: clamp(20px, 1.95vw, 29px);
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vantage-menu-toggle {
          display: none;
        }

        .vantage-hero {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .vantage-hero-content {
          position: absolute;
          left: var(--gutter-start);
          bottom: var(--hero-bottom);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 5;
          pointer-events: auto;
        }

        .vantage-hero-title {
          font-family: "Reference Display", "Reference Sans", Arial, sans-serif;
          font-weight: 500;
          font-size: var(--display-size);
          line-height: var(--display-leading);
          font-optical-sizing: auto;
          letter-spacing: -2.1px;
          -webkit-text-stroke: .12px currentColor;
          white-space: nowrap;
          text-shadow: 0 2px 2px rgba(0,0,0,.44);
          margin: 0 0 var(--title-copy-gap) 0;
        }

        .vantage-line {
          display: block;
          transform-origin: left center;
          overflow: hidden;
        }

        .vantage-line-one {
          color: #fff;
          transform: scaleX(.775);
        }

        .vantage-line-two {
          color: rgba(211, 207, 207, .78);
          transform: scaleX(.793);
        }

        .vantage-line-reveal {
          display: inline-block;
        }

        .vantage-hero-copy {
          color: rgba(226, 229, 228, .84);
          font-size: var(--copy-size);
          line-height: var(--copy-leading);
          font-weight: 350;
          letter-spacing: .13px;
          width: clamp(390px, 31.67vw, 500px);
          left: 1px;
          position: relative;
          text-shadow: 0 1px 3px rgba(0,0,0,.7);
          margin: 0 0 var(--copy-cta-gap) 0;
        }

        .vantage-primary-cta {
          width: var(--cta-width);
          height: var(--cta-height);
          border-radius: 7px;
          background: #fff;
          color: #111;
          box-shadow: 0 1px 5px rgba(0,0,0,.38);
          position: relative;
          display: flex;
          align-items: center;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .vantage-primary-cta .label {
          position: absolute;
          left: 8.125%;
          font-size: var(--primary-control-font-size);
          font-weight: 450;
          letter-spacing: -.3px;
          color: #111;
          top: calc(50% + var(--control-baseline-shift));
          transform: translateY(-50%);
          white-space: nowrap;
        }

        .vantage-primary-cta .arrow-box {
          position: absolute;
          right: 3.125%;
          top: 14.286%;
          width: 20.625%;
          height: 71.429%;
          border-radius: 7px;
          background: #070909;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vantage-demo-card {
          position: absolute;
          right: var(--gutter-end);
          bottom: var(--hero-bottom);
          width: var(--card-width);
          aspect-ratio: 201 / 265;
          container-type: inline-size;
          z-index: 5;
          pointer-events: auto;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: clamp(12px, 1.52vh, 18px);
          background: linear-gradient(145deg, rgba(24,22,20,.80), rgba(5,12,14,.86));
          box-shadow:
            0 2px 10px rgba(0,0,0,.44),
            0 0 0 3px rgba(255,255,255,.035) inset,
            0 0 0 1px rgba(0,0,0,.9);
          backdrop-filter: blur(14px) saturate(108%);
          -webkit-backdrop-filter: blur(14px) saturate(108%);
          display: flex;
          flex-direction: column;
          padding: 3.5cqw;
          box-sizing: border-box;
        }

        .vantage-demo-visual {
          position: relative;
          width: 92.5cqw;
          height: 92cqw;
          border-radius: 4cqw;
          background: #101a1e;
          overflow: hidden;
          margin: 0.5cqw auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vantage-demo-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(.89) saturate(.93) contrast(1.03);
        }

        .vantage-demo-visual .play {
          position: absolute;
          width: 29cqw;
          height: 29cqw;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.34);
          background: rgba(3,5,7,.47);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0,0,0,.5);
        }

        .vantage-demo-visual .play svg {
          width: 12px;
          height: 14px;
          margin-left: 2px;
        }

        .vantage-watch-button {
          width: 100%;
          margin-top: auto;
          height: 26.5cqw;
          border-radius: 3.5cqw;
          border: 1px solid rgba(255,255,255,.21);
          background: linear-gradient(145deg, rgba(26,34,36,.86), rgba(16,29,33,.9));
          color: #fff;
          font-size: clamp(14px, 7.5cqw, 18px);
          font-weight: 430;
          letter-spacing: -.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,.35);
        }

        .vantage-watch-button span {
          transform: translateY(var(--watch-baseline-shift));
        }

        /* Motion Choreography */
        .vantage-scope.motion-pending .vantage-brand {
          opacity: 0;
          transform: translate3d(0, 7px, 0) scale(.94);
          animation: entrance-brand 580ms cubic-bezier(.16,1,.3,1) 60ms forwards;
        }

        .vantage-scope.motion-pending .vantage-nav-link:nth-child(1) {
          opacity: 0;
          transform: translate3d(0, 6px, 0);
          animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 130ms forwards;
        }

        .vantage-scope.motion-pending .vantage-nav-link:nth-child(2) {
          opacity: 0;
          transform: translate3d(0, 6px, 0);
          animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 175ms forwards;
        }

        .vantage-scope.motion-pending .vantage-nav-link:nth-child(3) {
          opacity: 0;
          transform: translate3d(0, 6px, 0);
          animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 220ms forwards;
        }

        .vantage-scope.motion-pending .vantage-nav-link:nth-child(4) {
          opacity: 0;
          transform: translate3d(0, 6px, 0);
          animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 265ms forwards;
        }

        .vantage-scope.motion-pending .vantage-time-panel {
          opacity: 0;
          transform: translate3d(0, 6px, 0);
          animation: entrance-nav 520ms cubic-bezier(.16,1,.3,1) 180ms forwards;
        }

        .vantage-scope.motion-pending .vantage-sign-up {
          opacity: 0;
          transform: translate3d(0, 8px, 0) scale(.985);
          animation: entrance-action 520ms cubic-bezier(.16,1,.3,1) 220ms forwards;
        }

        .vantage-scope.motion-pending .vantage-menu-toggle {
          opacity: 0;
          transform: translate3d(0, 8px, 0) scale(.985);
          animation: entrance-action 520ms cubic-bezier(.16,1,.3,1) 140ms forwards;
        }

        .vantage-scope.motion-pending .vantage-line-one .vantage-line-reveal {
          transform: translate3d(0, 110%, 0) skewY(2deg);
          animation: entrance-line 800ms cubic-bezier(.22,1,.36,1) 300ms forwards;
        }

        .vantage-scope.motion-pending .vantage-line-two .vantage-line-reveal {
          transform: translate3d(0, 110%, 0) skewY(2deg);
          animation: entrance-line 850ms cubic-bezier(.22,1,.36,1) 440ms forwards;
        }

        .vantage-scope.motion-pending .vantage-hero-copy {
          opacity: 0;
          transform: translate3d(0, 8px, 0);
          animation: entrance-copy 620ms cubic-bezier(.16,1,.3,1) 740ms forwards;
        }

        .vantage-scope.motion-pending .vantage-primary-cta {
          opacity: 0;
          transform: translate3d(0, 8px, 0) scale(.985);
          animation: entrance-action 560ms cubic-bezier(.16,1,.3,1) 960ms forwards;
        }

        .vantage-scope.motion-pending .vantage-demo-card {
          opacity: 0;
          transform: translate3d(0, 12px, 0) scale(.968);
          transform-origin: 82% 50%;
          animation: entrance-card 920ms cubic-bezier(.22,1,.36,1) 1040ms forwards;
        }

        @keyframes entrance-brand {
          from { opacity: 0; transform: translate3d(0, 7px, 0) scale(.94); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes entrance-nav {
          from { opacity: 0; transform: translate3d(0, 6px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes entrance-action {
          from { opacity: 0; transform: translate3d(0, 8px, 0) scale(.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes entrance-line {
          from { transform: translate3d(0, 110%, 0) skewY(2deg); }
          to { transform: translate3d(0, 0, 0) skewY(0deg); }
        }

        @keyframes entrance-copy {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes entrance-card {
          from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.968); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }

        /* Tablet Media Queries */
        @media (min-width: 620px) and (max-width: 790px), (min-width: 620px) and (max-width: 1100px) and (orientation: portrait) {
          .vantage-header-actions {
            position: absolute;
            top: calc(100% + 12px);
            right: 0;
            width: min(324px, calc(100vw - 2 * var(--gutter-start)));
            background: linear-gradient(145deg, rgba(16,22,25,.92), rgba(8,14,17,.95));
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 16px;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,.6);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px) scale(.985);
            pointer-events: none;
            transition: opacity 220ms ease, transform 220ms ease, visibility 220ms;
            z-index: 50;
          }

          .vantage-header.menu-open .vantage-header-actions {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
            pointer-events: auto;
          }

          .vantage-nav {
            margin-left: 0;
            top: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            width: 100%;
          }

          .vantage-nav-link:first-child { top: 0; }
          .vantage-nav-link.active::after {
            left: 0;
            transform: none;
            bottom: -4px;
            width: 32px;
          }

          .vantage-time-panel {
            margin-left: 0;
            width: 100%;
            border-left: none;
            border-top: 1px solid rgba(255,255,255,.12);
            padding-top: 14px;
            padding-left: 0;
            height: auto;
          }

          .vantage-sign-up {
            margin-left: 0;
            width: 100%;
          }

          .vantage-menu-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            width: 46px;
            height: 46px;
            border-radius: 11px;
            border: 1px solid rgba(255,255,255,.16);
            background: linear-gradient(145deg, rgba(26,34,36,.82), rgba(16,29,33,.88));
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow: 0 2px 10px rgba(0,0,0,.4);
            cursor: pointer;
            position: relative;
            top: -1px;
          }

          .vantage-menu-toggle-icon {
            width: 20px;
            height: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .vantage-menu-toggle-bar {
            width: 100%;
            height: 2px;
            background: #fff;
            border-radius: 1px;
            transition: transform 200ms ease, opacity 200ms ease;
            transform-origin: center;
          }

          .vantage-header.menu-open .vantage-menu-toggle-bar:first-child {
            transform: translateY(6px) rotate(45deg);
          }

          .vantage-header.menu-open .vantage-menu-toggle-bar:last-child {
            transform: translateY(-6px) rotate(-45deg);
          }
        }

        /* Mobile Media Query */
        @media (max-width: 619px) {
          .vantage-scope {
            --gutter-start: 20px;
            --gutter-end: 20px;
            --hero-bottom: max(24px, env(safe-area-inset-bottom, 24px));
          }

          .vantage-header-actions {
            position: absolute;
            top: calc(100% + 12px);
            right: 0;
            width: min(340px, calc(100vw - 40px));
            background: linear-gradient(145deg, rgba(16,22,25,.94), rgba(8,14,17,.97));
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 16px;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,.7);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px) scale(.985);
            pointer-events: none;
            transition: opacity 220ms ease, transform 220ms ease, visibility 220ms;
            z-index: 50;
          }

          .vantage-header.menu-open .vantage-header-actions {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
            pointer-events: auto;
          }

          .vantage-nav {
            margin-left: 0;
            top: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            width: 100%;
          }

          .vantage-nav-link:first-child { top: 0; }
          .vantage-nav-link.active::after {
            left: 0;
            transform: none;
            bottom: -4px;
            width: 32px;
          }

          .vantage-time-panel {
            margin-left: 0;
            width: 100%;
            border-left: none;
            border-top: 1px solid rgba(255,255,255,.12);
            padding-top: 14px;
            padding-left: 0;
            height: auto;
          }

          .vantage-sign-up {
            margin-left: 0;
            width: 100%;
          }

          .vantage-menu-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            width: 44px;
            height: 44px;
            border-radius: 11px;
            border: 1px solid rgba(255,255,255,.16);
            background: linear-gradient(145deg, rgba(26,34,36,.82), rgba(16,29,33,.88));
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            box-shadow: 0 2px 10px rgba(0,0,0,.4);
            cursor: pointer;
            position: relative;
            top: -1px;
          }

          .vantage-menu-toggle-icon {
            width: 18px;
            height: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .vantage-menu-toggle-bar {
            width: 100%;
            height: 2px;
            background: #fff;
            border-radius: 1px;
            transition: transform 200ms ease, opacity 200ms ease;
            transform-origin: center;
          }

          .vantage-header.menu-open .vantage-menu-toggle-bar:first-child {
            transform: translateY(5px) rotate(45deg);
          }

          .vantage-header.menu-open .vantage-menu-toggle-bar:last-child {
            transform: translateY(-5px) rotate(-45deg);
          }

          .vantage-line-one { transform: scaleX(.78); }
          .vantage-line-two { transform: scaleX(.55); }

          .vantage-hero-copy br { display: none; }
          .vantage-hero-copy {
            width: 100%;
            max-width: calc(100vw - 40px);
          }

          .vantage-demo-card {
            top: clamp(176px, 32svh, 300px);
            bottom: auto;
            right: var(--gutter-end);
          }
        }
      `}</style>

      <div className="vantage-screen" id="screen">
        {/* Exact Mandatory CloudFront Background Video */}
        <video
          className="vantage-background"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden="true"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4"
            type="video/mp4"
          />
        </video>

        {/* Top Header */}
        <header className={`vantage-header ${menuOpen ? 'menu-open' : ''}`}>
          <a className="vantage-brand" href="#home" aria-label="Vantage home">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="react-brand-disc">
                  <circle cx="12.5" cy="12.5" r="12.5" />
                </clipPath>
              </defs>
              <g clipPath="url(#react-brand-disc)">
                <circle cx="12.5" cy="12.5" r="12.5" fill="#ededed" />
                <path d="M12.5 2.5 L19.5 12.5 L12.5 22.5 L5.5 12.5 Z" fill="#050606" />
                <path d="M12.5 2.5 L19.5 12.5 L12.5 14.5 Z" fill="#737778" />
                <path d="M12.5 2.5 L12.5 14.5 L5.5 12.5 Z" fill="#fafafa" />
                <path d="M5.5 12.5 L12.5 14.5 L12.5 22.5 Z" fill="#0a0b0b" />
                <path d="M12.5 14.5 L19.5 12.5 L12.5 22.5 Z" fill="#383b3d" />
              </g>
            </svg>
          </a>

          <div className="vantage-header-actions" id="tablet-navigation">
            <nav className="vantage-nav">
              <a className="vantage-nav-link active" onClick={closeMenu}>Home</a>
              <a className="vantage-nav-link" onClick={onExploreDemo}>About</a>
              <a className="vantage-nav-link" onClick={onExploreDemo}>Services</a>
              <a className="vantage-nav-link" onClick={onExploreDemo}>Contact</a>
            </nav>

            <div className="vantage-time-panel">
              <div className="vantage-time-label">Timezone</div>
              <div className="vantage-time-value" dangerouslySetInnerHTML={{ __html: '9:47 PM&nbsp; • &nbsp;14 July 2026' }} />
            </div>

            <button className="vantage-sign-up" type="button" onClick={onExploreDemo}>
              Sign Up
            </button>
          </div>

          <button
            className="vantage-menu-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span className="vantage-menu-toggle-icon" aria-hidden="true">
              <span className="vantage-menu-toggle-bar" />
              <span className="vantage-menu-toggle-bar" />
            </span>
          </button>
        </header>

        {/* Hero Section */}
        <section className="vantage-hero">
          <div className="vantage-hero-content">
            <h1 className="vantage-hero-title">
              <span className="vantage-line vantage-line-one">
                <span className="vantage-line-reveal">Stop Digging</span>
              </span>
              <span className="vantage-line vantage-line-two">
                <span className="vantage-line-reveal">Through Dashboards.</span>
              </span>
            </h1>

            <p className="vantage-hero-copy">
              Your metrics are scattered across a dozen dashboards.<br />
              Vantage bring them into one clear signal, so every<br />
              decision is backed by data you actually trust.
            </p>

            <button className="vantage-primary-cta" type="button" onClick={onExploreDemo}>
              <span className="label">Get Started</span>
              <span className="arrow-box" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h8m0 0L7.5 3.5M11 7L7.5 10.5" />
                </svg>
              </span>
            </button>
          </div>

          {/* Glass Demo Card */}
          <article className="vantage-demo-card" onAnimationEnd={handleDemoCardAnimationEnd}>
            <div className="vantage-demo-visual">
              <img src="/assets/watch-demo-thumbnail.png" alt="Abstract red and blue smoke" />
              <button className="play" type="button" aria-label="Play demo" onClick={onExploreDemo}>
                <svg width="12" height="14" viewBox="0 0 12 14" fill="#fff" aria-hidden="true">
                  <path d="M2 1.5L11 7L2 12.5V1.5Z" />
                </svg>
              </button>
            </div>
            <button className="vantage-watch-button" type="button" onClick={onExploreDemo}>
              <span>Watch Demo</span>
            </button>
          </article>
        </section>
      </div>
    </div>
  );
};
