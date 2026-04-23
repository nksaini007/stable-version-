import React from 'react';
import './ComingSoon.css';

const cardData = Array.from({ length: 45 }).map((_, index) => {
  const variations = [
    { type: 'handle', text: '@stinchar_desk' },
    { type: 'branding', text: 'stinchar\nplatform\n2.0.' },
    { type: 'description', text: 'MARKET\nLAUNCH\nAHEAD.' },
    { type: 'branding', text: 'premium\nquality\nbuilt.' },
    { type: 'description', text: 'INNOVATION\nAWAITS' },
    { type: 'branding', text: 'redefining\nthe market.' },
    { type: 'branding', text: 'almost\nhere.' },
    { type: 'description', text: 'STAY\nTUNED' },
    { type: 'branding', text: 'next\ngeneration.' },
  ];
  return {
    id: index + 1,
    variation: variations[index % variations.length]
  };
});

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-cards">
        {cardData.map((card) => (
          <div key={card.id} className={`card card-${card.id}`}>
            <h2 className="title">coming<br />soon.</h2>
            {card.variation && (
               <span className={`subtitle ${card.variation.type}`}>
                 {card.variation.text.split('\n').map((line, i) => (
                   <React.Fragment key={i}>{line}<br/></React.Fragment>
                 ))}
               </span>
            )}
            {(card.id % 3 === 0) && <span className="subtitle handle">@stinchar</span>}
          </div>
        ))}
      </div>
      <div className="overlay-gradient"></div>
    </div>
  );
};

export default ComingSoon;
