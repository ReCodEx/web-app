// @flow
import React from 'react';
import PropTypes from 'prop-types';

const withLinks = (Inner: *) => {
  const ComponentWithLinks = (props: any, { links }: { links: any }) => (
    <Inner {...props} links={links} />
  );
  ComponentWithLinks.displayName = `withLinks(${Inner.displayName || Inner.name || 'Component'})`;
  ComponentWithLinks.contextTypes = {
    links: PropTypes.object
  };

  return ComponentWithLinks;
};

export default withLinks;
