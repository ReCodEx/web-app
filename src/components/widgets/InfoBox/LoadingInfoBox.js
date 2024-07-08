import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import InfoBox from './InfoBox.js';

const LoadingInfoBox = ({
  title = <FormattedMessage id="generic.loading" defaultMessage="Loading..." />,
  description = <FormattedMessage id="generic.loading" defaultMessage="Loading..." />,
  ...props
}) => <InfoBox icon="sync" spin title={title} description={description} color="gray" {...props} />;

LoadingInfoBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export default LoadingInfoBox;
