import React, { PropTypes } from 'react';
import TreeViewLeaf from './TreeViewLeaf';
import TreeViewInnerNode from './TreeViewInnerNode';

const TreeViewItem = (props) =>
  props.children && props.children.length >= 1
    ? <TreeViewInnerNode {...props} />
    : <TreeViewLeaf {...props} />;

TreeViewItem.propTypes = {
  children: PropTypes.array
};

export default TreeViewItem;
