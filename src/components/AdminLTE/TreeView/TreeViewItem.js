import React, { PropTypes, Component } from 'react';
import Collapse from 'react-collapse';
import Icon from 'react-fontawesome';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import TreeView from './TreeView';

class TreeViewItem extends Component {

  state = { isOpen: true };
  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  renderToggleBtn = (isOpen) => (
    <Button onClick={this.toggleOpen} bsStyle='default' className='btn-flat' bsSize='xs'>
      {isOpen
        ? <Icon name='angle-down' />
        : <Icon name='angle-right' />}
    </Button>
  );

  render() {
    const { title, href, children, forceOpen } = this.props;
    const { isOpen } = this.state;
    const open = isOpen || forceOpen;

    return (
      <li style={{ listStyleType: children ? 'none' : 'disc' }}>
        {children && this.renderToggleBtn(open)}
        {title}
        {children && (
          <Collapse isOpened={open}>
            <TreeView nested>
              {children}
            </TreeView>
          </Collapse>
        )}
      </li>
    );
  }

}

TreeViewItem.propTypes = {

};

export default TreeViewItem;
