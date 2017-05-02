import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';

const TreeView = ({
  children
}) => (
  <Nav stacked>
    {children}
  </Nav>
);

TreeView.propTypes = {
  children: PropTypes.any.isRequired
};

export default TreeView;
