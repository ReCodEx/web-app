import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Collapse from 'react-collapse';
import TreeViewLeaf from './TreeViewLeaf';

class TreeViewInnerNode extends Component {
  state = {
    isOpen: false,
    isOpenInitial: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (state.isOpenInitial !== props.isOpen) {
      return {
        isOpen: props.isOpen || false,
        isOpenInitial: props.isOpen,
      };
    } else {
      return null;
    }
  }

  toggleOpen = e => {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  };

  isOpen = () => this.props.forceOpen || this.state.isOpen;

  render() {
    const { loading, children, ...props } = this.props;

    return (
      <ul className="nav flex-column">
        <TreeViewLeaf
          {...props}
          loading={loading}
          onClick={!this.props.forceOpen ? this.toggleOpen : undefined}
          icon={this.props.forceOpen ? 'square' : this.isOpen() ? 'minus-square' : 'plus-square'}
        />
        <Collapse isOpened={this.isOpen()}>{children}</Collapse>
      </ul>
    );
  }
}

TreeViewInnerNode.propTypes = {
  loading: PropTypes.bool,
  isOpen: PropTypes.bool,
  forceOpen: PropTypes.bool,
  children: PropTypes.any,
};

export default TreeViewInnerNode;
