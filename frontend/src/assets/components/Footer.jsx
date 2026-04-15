import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '14px 24px',
      textAlign: 'center',
      flexShrink: 0,
      width: '100%',
    }}>
      <span style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.2)',
        fontWeight: 500,
        letterSpacing: '0.06em',
      }}>
        © {new Date().getFullYear()} Stinchar · All Rights Reserved
      </span>
    </footer>
  );
};

export default Footer;
