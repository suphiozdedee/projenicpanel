
import React from 'react';
import MasterButton from './MasterButton';

// Wrapper to ensure backward compatibility while enforcing new unified style
const SketchButton = React.forwardRef((props, ref) => {
  return <MasterButton ref={ref} {...props} />;
});

SketchButton.displayName = "SketchButton";
export default SketchButton;
