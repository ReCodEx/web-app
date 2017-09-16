import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Box from '../../widgets/Box';
import EditSimpleLimits from '../../forms/EditSimpleLimits';

const EditSimpleLimitsBox = ({ editLimits, limits, ...props }) =>
  <Box
    title={
      <FormattedMessage
        id="app.editLimitsBox.title"
        defaultMessage="Edit limits"
      />
    }
    unlimitedHeight
  >
    <EditSimpleLimits editLimits={editLimits} limits={limits} {...props} />
  </Box>;

EditSimpleLimitsBox.propTypes = {
  editLimits: PropTypes.func.isRequired,
  limits: PropTypes.func.isRequired
};

export default EditSimpleLimitsBox;
