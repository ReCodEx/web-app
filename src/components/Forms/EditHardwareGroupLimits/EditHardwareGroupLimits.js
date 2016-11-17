import React, { PropTypes } from 'react';
import { TabbedArrayField } from '../Fields';

import HardwareGroupFields from './HardwareGroupFields';

const EditHardwareGroupLimits = ({
  limits,
  ...props
}) => (
  <TabbedArrayField
    {...props}
    limits={limits}
    getTitle={i => limits[i].hardwareGroup}
    id='edit-hardware-group-limits'
    add={false}
    remove={false}
    ContentComponent={HardwareGroupFields} />
);

EditHardwareGroupLimits.propTypes = {
  limits: PropTypes.array
};

export default EditHardwareGroupLimits;
