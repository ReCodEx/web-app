import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const withIntl = Inner => {
  const ComponentWithIntl = props => {
    const intl = useIntl();
    return <Inner {...props} intl={intl} />;
  };
  ComponentWithIntl.displayName = `withIntl(${Inner.displayName || Inner.name || 'Component'})`;
  ComponentWithIntl.WrappedComponent = Inner; // use the same name as react-redux
  return ComponentWithIntl;
};

export default withIntl;

export const withIntlProps = {
  intl: PropTypes.object.isRequired,
};
