import React, { PropTypes, Component } from 'react';
import Collapse from 'react-collapse';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import LevelGap from './LevelGap';
import TreeView from './TreeView';
import TreeViewLeaf from './TreeViewLeaf';

class TreeViewInnerNode extends Component {

  state = { isOpen: true };
  toggleOpen = e => {
    e.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  };
  isOpen = () =>
    this.props.forceOpen || this.state.isOpen;

  render() {
    const {
      title,
      actions,
      level,
      children
    } = this.props;

    return (
      <Nav stacked>
        <TreeViewLeaf
          title={title}
          actions={actions}
          level={level}
          onClick={this.toggleOpen}
          icon={this.isOpen() ? 'angle-down' : 'angle-right'} />
        <Collapse isOpened={this.isOpen()}>
          {children}
        </Collapse>
      </Nav>
    );
  }

}

TreeViewInnerNode.propTypes = {

};

export default TreeViewInnerNode;
