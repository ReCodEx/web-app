import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Icon, { CloseIcon, SwapIcon } from '../../icons';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import {
  FUNCTION_NODE,
  TEST_NODE,
  LITERAL_NODE,
  AstNode,
  AstNodeValue,
  AstNodePlaceholder,
} from '../../../helpers/exercise/scoreAst';
import { EMPTY_OBJ } from '../../../helpers/common';

import style from './tree.less';

// Icons representing generic types of nodes
const ICONS = {
  [FUNCTION_NODE]: 'square-root-alt',
  [TEST_NODE]: 'balance-scale',
  [LITERAL_NODE]: 'dollar-sign',
};

// CSS classes used for icons representing generic types
const ICONS_CSS_CLASSES = {
  [FUNCTION_NODE]: 'text-info',
  [TEST_NODE]: 'text-warning',
  [LITERAL_NODE]: 'text-muted',
};

// Tooltips for add buttons for individual generic types
const ADD_NODE_TOOLTIPS = {
  [FUNCTION_NODE]: <FormattedMessage id="app.scoreConfigExpression.addFunction" defaultMessage="Add function node" />,
  [TEST_NODE]: <FormattedMessage id="app.scoreConfigExpression.addTestResult" defaultMessage="Add test result node" />,
  [LITERAL_NODE]: <FormattedMessage id="app.scoreConfigExpression.addLiteral" defaultMessage="Add numeric literal" />,
};

// Internal variables for getAncestorNodesIndex memoization
var _ancestorIndex = null;
var _ancestorIndexOrigin = null;
var _ancestorIndexParent = null;

/**
 * Return all ancestors of node in an object (keys are node IDs).
 * The ancestor index can be used to quickly determine whether a node is an ancestor of selected node.
 * @param {AstNode} node Selected node ancestors of which are returned.
 */
const getAncestorNodesIndex = node => {
  if (_ancestorIndexOrigin !== node || _ancestorIndexParent !== node.getParent()) {
    // manual memoization
    _ancestorIndexOrigin = node;
    _ancestorIndexParent = node.getParent();
    _ancestorIndex = {};
    while (node && node.getParent() && node.getParent() instanceof AstNode) {
      node = node.getParent();
      _ancestorIndex[node.id] = node;
    }
  }
  return _ancestorIndex;
};

/**
 * Compute how many children of given node are vacant (non existent or occupied by placeholders)
 * @param {AstNode} parent
 */
const getVacantChildrenPositions = parent => {
  if (!parent || !(parent instanceof AstNode)) {
    return 0; // parent of the actual root of the tree (and the root is always occupied)
  }
  const siblings = parent.getRealChildren();
  return parent.getMaxChildren() - siblings.length;
};

const nodeValuePrettyPrint = value => `${Math.round(value * 1000) / 1000}`;

// Placeholders are rather special nodes, so we have a separate component for them...
const ExpressionNodePlaceholder = ({
  node = null,
  parent,
  selectedNodes = EMPTY_OBJ,
  editNode,
  hasSelectedParent = false,
}) => {
  // When copying, there must be enough vacant space for all selected nodes.
  // When moving, there must be enough vacant space for all selected nodes except siblings (since they are moved under the same parent)
  const selectedNodesCount = Object.values(selectedNodes).length;
  const selecteNodeObjects = Object.values(selectedNodes);

  return (
    <li>
      <span className={style.placeholder}>
        {[FUNCTION_NODE, TEST_NODE, LITERAL_NODE].map(genericClass => (
          <OverlayTrigger
            key={genericClass}
            placement="bottom"
            overlay={
              <Tooltip id={`${(node || parent).id}-add-${genericClass}`}>{ADD_NODE_TOOLTIPS[genericClass]}</Tooltip>
            }>
            <Icon
              icon={ICONS[genericClass]}
              className={ICONS_CSS_CLASSES[genericClass]}
              gapLeft
              gapRight
              timid
              onClick={() => editNode(node, parent, genericClass)}
            />
          </OverlayTrigger>
        ))}

        {selectedNodesCount > 0 && (node || parent).canCopyNodesHere(selecteNodeObjects) && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`${(node || parent).id}-copy`}>
                <FormattedMessage id="app.scoreConfigExpression.copy" defaultMessage="Copy selected node(s) here" />
              </Tooltip>
            }>
            <Icon
              icon={['far', 'copy']}
              gapLeft
              gapRight
              timid
              onClick={() => (node || parent).copyNodesHere(selecteNodeObjects)}
            />
          </OverlayTrigger>
        )}

        {selectedNodesCount > 0 && !hasSelectedParent && (node || parent).canMoveNodesHere(selecteNodeObjects) && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`${(node || parent).id}-move`}>
                <FormattedMessage id="app.scoreConfigExpression.move" defaultMessage="Move selected node(s) here" />
              </Tooltip>
            }>
            <Icon
              icon="external-link-alt"
              gapLeft
              gapRight
              timid
              onClick={() => (node || parent).moveNodesHere(selecteNodeObjects)}
            />
          </OverlayTrigger>
        )}
      </span>
    </li>
  );
};

const ExpressionNode = ({
  node,
  testsIndex = EMPTY_OBJ,
  selectedNodes = EMPTY_OBJ,
  parent = null,
  editNode = null,
  selectNode = null,
  hasSelectedParent = false,
}) => {
  const genericClass = node.getGenericClass();
  const description = node.getDescription();
  const isSelected = Boolean(selectedNodes[node.id]);
  const selectedNodesCount = Object.keys(selectedNodes).length;
  const selectedNode = selectedNodesCount === 1 ? Object.values(selectedNodes)[0] : null;
  const ancestorIndex = selectedNodesCount === 1 ? getAncestorNodesIndex(selectedNode) : null;

  return node && !(node instanceof AstNodePlaceholder) ? (
    <li>
      <span
        className={classnames({
          [style[genericClass]]: true,
          [style.invalid]: !node.isValid(),
          [style.selected]: isSelected,
          [style.clickable]: editNode,
        })}>
        <OptionalTooltipWrapper
          tooltip={description}
          hide={!description}
          placement="bottom"
          tooltipId={`${node.id}-info`}>
          <span
            onClick={ev => selectNode && selectNode(node, ev.ctrlKey)}
            onDoubleClick={() => editNode && editNode(node)}>
            {genericClass && <Icon icon={ICONS[genericClass]} className={ICONS_CSS_CLASSES[genericClass]} gapRight />}
            {node.getCaption(testsIndex)}
          </span>
        </OptionalTooltipWrapper>

        {editNode && (
          <React.Fragment>
            {isSelected && selectedNodesCount === 1 && (
              <React.Fragment>
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip id={`${node.id}-injectParent`}>
                      <FormattedMessage
                        id="app.scoreConfigExpression.addNewParent"
                        defaultMessage="Insert new parent (move the node one level down)"
                      />
                    </Tooltip>
                  }>
                  <Icon
                    icon="sign-in-alt"
                    className="text-success"
                    gapLeft
                    onClick={() => editNode(node, null, FUNCTION_NODE, true)}
                  />
                </OverlayTrigger>
              </React.Fragment>
            )}

            {isSelected &&
              selectedNodesCount === 1 &&
              node.getRealChildren().length > 0 &&
              getVacantChildrenPositions(node.getParent()) + 1 >= node.getRealChildren().length && (
                <React.Fragment>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`${node.id}-remove`}>
                        <FormattedMessage
                          id="app.scoreConfigExpression.removeOnlyNode"
                          defaultMessage="Remove only this node (children are moved upwards)"
                        />
                      </Tooltip>
                    }>
                    <Icon icon="sign-out-alt" className="text-danger" gapLeft onClick={() => node.remove()} />
                  </OverlayTrigger>
                </React.Fragment>
              )}

            {!isSelected &&
            !hasSelectedParent && // selected node is not parent of node
            ancestorIndex && // ancestorIndex exists -> exactly one node is selected
            !ancestorIndex[node.id] && // node is not parent of selected node
            (selectedNode.getParent() !== node.getParent() || !node.getParent().isComutative()) && ( // node is not sibling, or the order of sbilings matter
                <React.Fragment>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id={`${node.id}-swap`}>
                        <FormattedMessage
                          id="app.scoreConfigExpression.swapNodes"
                          defaultMessage="Swap with selected node (including sub-trees)"
                        />
                      </Tooltip>
                    }>
                    <SwapIcon className="text-success" gapLeft onClick={() => node.swap(selectedNode)} />
                  </OverlayTrigger>
                </React.Fragment>
              )}

            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`${node.id}-removeTree`}>
                  <FormattedMessage id="app.scoreConfigExpression.removeNode" defaultMessage="Remove this node" />
                </Tooltip>
              }>
              <CloseIcon className="text-danger" gapLeft timid onClick={() => node.removeWholeSubtree()} />
            </OverlayTrigger>
          </React.Fragment>
        )}
      </span>

      {node.evaluated !== null && !(node instanceof AstNodeValue) && (
        <small className="text-muted em-padding-left">= {nodeValuePrettyPrint(node.evaluated)}</small>
      )}

      {node.children && (
        <ul>
          {node.children.map((child, idx) => (
            <ExpressionNode
              key={idx}
              node={child}
              parent={node}
              testsIndex={testsIndex}
              selectedNodes={selectedNodes}
              editNode={editNode}
              selectNode={selectNode}
              hasSelectedParent={isSelected || hasSelectedParent}
            />
          ))}

          {editNode &&
            node.isComutative() &&
            node.children.length < node.getMaxChildren() &&
            !(node.getLastChild() instanceof AstNodePlaceholder) && (
              <ExpressionNodePlaceholder
                parent={node}
                editNode={editNode}
                selectedNodes={selectedNodes}
                hasSelectedParent={isSelected || hasSelectedParent}
              />
            )}
        </ul>
      )}
    </li>
  ) : editNode ? (
    <ExpressionNodePlaceholder
      node={node}
      parent={parent}
      editNode={editNode}
      selectedNodes={selectedNodes}
      hasSelectedParent={isSelected || hasSelectedParent}
    />
  ) : null;
};

ExpressionNodePlaceholder.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  selectedNodes: PropTypes.object,
  parent: PropTypes.instanceOf(AstNode),
  editNode: PropTypes.func.isRequired,
  hasSelectedParent: PropTypes.bool,
};

ExpressionNode.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  testsIndex: PropTypes.object,
  selectedNodes: PropTypes.object,
  parent: PropTypes.instanceOf(AstNode),
  editNode: PropTypes.func,
  selectNode: PropTypes.func,
  hasSelectedParent: PropTypes.bool,
};

export default ExpressionNode;
