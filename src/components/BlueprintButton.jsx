
import React from 'react';
import MasterButton from './MasterButton';

// Wrapper to ensure backward compatibility while enforcing new unified style
const BlueprintButton = React.forwardRef((props, ref) => {
  return <MasterButton ref={ref} {...props} />;
});

BlueprintButton.displayName = "BlueprintButton";
export default BlueprintButton;
