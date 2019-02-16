// @flow
import React from 'react';
import PropTypes from 'prop-types';

const withLinks = (Inner: *) => {
  const ComponentWithLinks = (props: any, { links }: { links: any }) => <Inner {...props} links={links} />;
  ComponentWithLinks.displayName = `withLinks(${Inner.displayName || Inner.name || 'Component'})`;
  ComponentWithLinks.contextTypes = {
    links: PropTypes.object,
  };
  ComponentWithLinks.WrappedComponent = Inner; // use the same name as react-redux
  return ComponentWithLinks;
};

export default withLinks;
