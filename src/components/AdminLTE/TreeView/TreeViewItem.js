import React, { PropTypes, Component } from 'react';
import Collapse from 'react-collapse';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import TreeView from './TreeView';
import TreeViewLeaf from './TreeViewLeaf';
import TreeViewInnerNode from './TreeViewInnerNode';

const TreeViewItem = props =>
  props.children && props.children.length >= 1
    ? <TreeViewInnerNode {...props} />
    : <TreeViewLeaf {...props} />;

export default TreeViewItem;
