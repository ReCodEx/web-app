import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * This component is a hack to prevent rendering of the children when the component is not mounted.
 * This is useful when the component has side effects that should not be executed when the component is not mounted.
 * Currently all ReduxForm have side effects (initialization) that take place during the first render and it slows down transitions between pages
 * (when the re-rendering of the old page is triggered by not-mounted renders of the new page).
 */
class OnlyMounted extends Component {
  state = { mounted: false };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  render() {
    const { children, fallback = null } = this.props;
    return this.state.mounted
      ? children
      : fallback || <div className="bg-secondary-subtle p-5 mb-1 w-100 rounded opacity-50" />;
  }
}

OnlyMounted.propTypes = {
  fallback: PropTypes.any,
  children: PropTypes.any,
};

export default OnlyMounted;
