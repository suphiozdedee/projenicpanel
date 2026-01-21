
import React from 'react';
import MasterButton from './MasterButton';

// Wrapper to ensure backward compatibility while enforcing new unified style
const ProfessionalButton = React.forwardRef((props, ref) => {
  return <MasterButton ref={ref} {...props} />;
});

ProfessionalButton.displayName = "ProfessionalButton";
export default ProfessionalButton;
