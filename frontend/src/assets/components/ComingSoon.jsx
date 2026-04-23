import React from 'react';
import './ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-cards">
        <div className="card card-1">
          <h2 className="title">coming<br />soon.</h2>
          <span className="subtitle handle">@stinchar_desk</span>
          <span className="subtitle description">MORE THAN<br />JUST A PLATFORM</span>
        </div>
        <div className="card card-2">
          <h2 className="title">coming<br />soon.</h2>
          <span className="subtitle handle">@stinchar</span>
          <span className="subtitle branding">stinchar<br />platform<br />2.0.</span>
        </div>
        <div className="card card-3">
          <h2 className="title">coming<br />soon.</h2>
          <span className="subtitle branding" style={{ bottom: '2rem', left: 'auto', right: '2rem', textAlign: 'right' }}>
            a new standard<br/>is arriving.
          </span>
        </div>
        <div className="card card-4">
          <h2 className="title">coming<br />soon.</h2>
          <span className="subtitle description">MARKET<br />LAUNCH<br />AHEAD.</span>
        </div>
        <div className="card card-5">
          <h2 className="title">coming<br />soon.</h2>
          <span className="subtitle branding">premium<br />quality<br />built.</span>
          <span className="subtitle handle">@stinchar</span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
