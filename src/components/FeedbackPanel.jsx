import React from 'react';

const FeedbackPanel = ({ phase, instruction }) => {
  return (
    <div className={`feedback-panel ${phase}`}>
      <div className={`phase-label ${phase}`}>
        {phase === 'past' ? 'Past Zone' : phase === 'to' ? 'To Zone' : 'Start'}
      </div>
      <div className="instruction-text">
        {instruction}
      </div>
    </div>
  );
};

export default FeedbackPanel;
