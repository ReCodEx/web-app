import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Icon, { CloseIcon } from '../../icons';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Confirm from '../../forms/Confirm';
import {
  FUNCTION_NODE,
  TEST_NODE,
  LITERAL_NODE,
  AstNode,
  AstNodePlaceholder,
} from '../../../helpers/exercise/scoreAst';

import style from './tree.less';

const ICONS = {
  [FUNCTION_NODE]: 'square-root-alt',
  [TEST_NODE]: 'balance-scale',
  [LITERAL_NODE]: 'dollar-sign',
};

const ICONS_CSS_CLASSES = {
  [FUNCTION_NODE]: 'text-info',
  [TEST_NODE]: 'text-warning',
  [LITERAL_NODE]: 'text-muted',
};

const ADD_NODE_TOOLTIPS = {
  [FUNCTION_NODE]: <FormattedMessage id="app.scoreConfigExpression.addFunction" defaultMessage="Add function node" />,
  [TEST_NODE]: <FormattedMessage id="app.scoreConfigExpression.addTestResult" defaultMessage="Add test result node" />,
  [LITERAL_NODE]: <FormattedMessage id="app.scoreConfigExpression.addLiteral" defaultMessage="Add numeric literal" />,
};

const ExpressionNodePlaceholder = ({ node = null, parent, editNode }) => (
  <li>
    <span className={style.placeholder}>
      {[FUNCTION_NODE, TEST_NODE, LITERAL_NODE].map(genericClass => (
        <OverlayTrigger
          key={genericClass}
          placement="bottom"
          overlay={
            <Tooltip id={`${(node || parent).id}-add-${genericClass}`}>
              {ADD_NODE_TOOLTIPS[genericClass]}
              <FormattedMessage id="app.scoreConfigExpression.addFunction" defaultMessage="Add function node" />
            </Tooltip>
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
    </span>
  </li>
);

const ExpressionNode = ({ node, parent = null, editNode = null }) => {
  const genericClass = node.getGenericClass();
  const description = node.getDescription();

  return node && !(node instanceof AstNodePlaceholder) ? (
    <li>
      <span className={classnames({ [style[genericClass]]: true, [style.invalid]: !node.isValid() })}>
        <OptionalTooltipWrapper
          tooltip={description}
          hide={!description}
          placement="bottom"
          tooltipId={`${node.id}-info`}>
          <span onDoubleClick={() => editNode && editNode(node)}>
            {genericClass && <Icon icon={ICONS[genericClass]} className={ICONS_CSS_CLASSES[genericClass]} gapRight />}
            {node.getCaption()}
          </span>
        </OptionalTooltipWrapper>

        {editNode && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`${node.id}-remove`}>
                <FormattedMessage id="app.scoreConfigExpression.removeNode" defaultMessage="Remove this node" />
              </Tooltip>
            }>
            {node.children && node.children.length > 0 ? (
              <Confirm
                id={`${node.id}-removeConfirm`}
                onConfirmed={() => node.delete()}
                question={
                  <FormattedMessage
                    id="app.scoreConfigExpression.removeSubtreeConfirm"
                    defaultMessage="This action will remove this node and the entire sub-tree. Do you wish to proceed?"
                  />
                }>
                <CloseIcon className="text-danger" gapLeft timid />
              </Confirm>
            ) : (
              <CloseIcon className="text-danger" gapLeft timid onClick={() => node.delete()} />
            )}
          </OverlayTrigger>
        )}
      </span>

      {node.children && (
        <ul>
          {node.children.map((child, idx) => (
            <ExpressionNode key={idx} node={child} parent={node} editNode={editNode} />
          ))}

          {editNode &&
            node.isComutative() &&
            node.children.length < node.getMaxChildren() &&
            !(node.getLastChild() instanceof AstNodePlaceholder) && (
              <ExpressionNodePlaceholder parent={node} editNode={editNode} />
            )}
        </ul>
      )}
    </li>
  ) : editNode ? (
    <ExpressionNodePlaceholder node={node} parent={parent} editNode={editNode} />
  ) : null;
};

ExpressionNodePlaceholder.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.instanceOf(AstNode),
  editNode: PropTypes.func.isRequired,
};

ExpressionNode.propTypes = {
  node: PropTypes.instanceOf(AstNode),
  parent: PropTypes.instanceOf(AstNode),
  editNode: PropTypes.func,
};

export default ExpressionNode;
