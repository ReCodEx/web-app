import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Icon from '../../icons';
import DateTime from '../../widgets/DateTime';
import withLinks from '../../../helpers/withLinks';

const PipelinesListItem = ({
  id,
  name,
  author,
  parameters,
  createdAt,
  createActions,
  links: { PIPELINE_URI_FACTORY }
}) =>
  <tr>
    <td className="text-nowrap shrink-col">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`${id}-pipeline`}>
            {author
              ? <FormattedMessage
                  id="app.pipelinesList.authoredPipelineIconTooltip"
                  defaultMessage="Authored pipeline which can be used in custom exercise configurations."
                />
              : <FormattedMessage
                  id="app.pipelinesList.universalPipelineIconTooltip"
                  defaultMessage="Universal pipeline which is used in common (simple) exercise configurations."
                />}
          </Tooltip>
        }
      >
        <Icon
          icon="random"
          className={author ? 'text-muted' : 'text-primary'}
        />
      </OverlayTrigger>
    </td>
    <td className="text-center shrink-col text-muted">
      {parameters.isCompilationPipeline &&
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`${id}-compilation`}>
              <FormattedMessage
                id="app.pipelinesList.compilationIconTooltip"
                defaultMessage="Compilation pipeline"
              />
            </Tooltip>
          }
        >
          <Icon icon="cogs" />
        </OverlayTrigger>}
      {parameters.isExecutionPipeline &&
        !parameters.judgeOnlyPipeline &&
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`${id}-execution`}>
              <FormattedMessage
                id="app.pipelinesList.executionIconTooltip"
                defaultMessage="Execution (testing) pipeline"
              />
            </Tooltip>
          }
        >
          <Icon icon="bolt" />
        </OverlayTrigger>}
      {parameters.judgeOnlyPipeline &&
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`${id}-judgeOnly`}>
              <FormattedMessage
                id="app.pipelinesList.judgeOnlyIconTooltip"
                defaultMessage="Judge-only pipeline"
              />
            </Tooltip>
          }
        >
          <Icon icon="balance-scale" />
        </OverlayTrigger>}
    </td>
    <td className="text-center shrink-col text-muted">
      {parameters.producesStdout &&
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`${id}-stdout`}>
              <FormattedMessage
                id="app.pipelinesList.stdoutIconTooltip"
                defaultMessage="Tested solution is expected to yield results to standard output"
              />
            </Tooltip>
          }
        >
          <Icon icon="align-left" gapRight />
        </OverlayTrigger>}
      {parameters.producesFiles &&
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`${id}-file`}>
              <FormattedMessage
                id="app.pipelinesList.fileIconTooltip"
                defaultMessage="Tested solution is expected to yield results into a specific file"
              />
            </Tooltip>
          }
        >
          <Icon icon={['far', 'file-alt']} gapRight />
        </OverlayTrigger>}
    </td>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>
          {name}
        </Link>
      </strong>
    </td>
    <td>
      {author ? <UsersNameContainer userId={author} /> : <i>ReCodEx</i>}
    </td>
    <td>
      <DateTime unixts={createdAt} showRelative />
    </td>
    <td className="text-right">
      {createActions && createActions(id)}
    </td>
  </tr>;

PipelinesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string,
  parameters: PropTypes.object,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(PipelinesListItem);
