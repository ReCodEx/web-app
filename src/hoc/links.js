// @flow
import React, { PropTypes, Component } from 'react';

const links = (Inner: *) =>
  class extends Component {
    static contextTypes = {
      links: PropTypes.object
    };

    render = () => <Inner {...this.props} links={this.context.links} />;
  };

export default links;
