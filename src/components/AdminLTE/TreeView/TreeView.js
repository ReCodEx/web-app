import React, { PropTypes } from 'react';
import { Nav } from 'react-bootstrap';

const TreeView = ({
  children
}) => (
  <Nav stacked>
    {children}
  </Nav>
);

TreeView.propTypes = {
};

export default TreeView;
