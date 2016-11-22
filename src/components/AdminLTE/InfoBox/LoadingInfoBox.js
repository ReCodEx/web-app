import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import InfoBox from './InfoBox';

const LoadingInfoBox = ({
  title = <FormattedMessage id='app.loadingInfoBox.title' defaultMessage='Loading ...' />,
  description = <FormattedMessage id='app.loadingInfoBox.description' defaultMessage='Loading ...' />,
  ...props
}) => (
  <InfoBox
    icon='rotate-right'
    spin
    title={title}
    description={description}
    color='gray'
    {...props} />
);

LoadingInfoBox.propTypes = {
  title: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ]),
  description: PropTypes.oneOfType([ PropTypes.string, PropTypes.element ])
};

export default LoadingInfoBox;
