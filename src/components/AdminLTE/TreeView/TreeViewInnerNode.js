import React, { PropTypes, Component } from 'react';
import Collapse from 'react-collapse';
import TreeViewLeaf from './TreeViewLeaf';

class TreeViewInnerNode extends Component {

  componentWillMount() {
    const { isOpen = false } = this.props;
    this.setState({ isOpen });
  }

  toggleOpen = (e) => {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  };

  isOpen = () => this.props.forceOpen || this.state.isOpen;

  render() {
    const {
      loading,
      children,
      ...props
    } = this.props;

    return (
      <ul className="nav nav-stacked">
        <TreeViewLeaf
          {...props}
          loading={loading}
          onClick={this.toggleOpen}
          icon={this.isOpen() ? 'square' : 'plus-square'} />
        <Collapse isOpened={this.isOpen()}>
          {children}
        </Collapse>
      </ul>
    );
  }

}

TreeViewInnerNode.propTypes = {
  loading: PropTypes.bool,
  isOpen: PropTypes.bool,
  forceOpen: PropTypes.bool,
  children: PropTypes.any
};

export default TreeViewInnerNode;
