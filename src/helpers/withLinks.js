// @flow
import React from 'react';
import { LinksContext } from '../helpers/contexts';

const withLinks = Inner => {
  const ComponentWithLinks = props => (
    <LinksContext.Consumer>{links => <Inner {...props} links={links} />}</LinksContext.Consumer>
  );
  ComponentWithLinks.displayName = `withLinks(${Inner.displayName || Inner.name || 'Component'})`;
  ComponentWithLinks.WrappedComponent = Inner; // use the same name as react-redux
  return ComponentWithLinks;
};

export default withLinks;
