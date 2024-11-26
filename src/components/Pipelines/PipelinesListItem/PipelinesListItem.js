import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import Icon, { PipelineIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import withLinks from '../../../helpers/withLinks.js';

const PipelinesListItem = ({
  id,
  name,
  author,
  parameters,
  createdAt,
  showAuthor = false,
  showCreatedAt = false,
  fullWidthName = false,
  createActions,
  links: { PIPELINE_URI_FACTORY },
}) => (
  <tr>
    <td className="text-nowrap shrink-col">
      <PipelineIcon
        className={author ? 'text-body-secondary' : 'text-primary'}
        tooltipId={`${id}-pipeline`}
        tooltipPlacement="bottom"
        tooltip={
          author ? (
            <FormattedMessage
              id="app.pipelinesList.authoredPipelineIconTooltip"
              defaultMessage="Authored pipeline which can be used in custom exercise configurations."
            />
          ) : (
            <FormattedMessage
              id="app.pipelinesList.universalPipelineIconTooltip"
              defaultMessage="Universal pipeline which is used in common (simple) exercise configurations."
            />
          )
        }
      />
    </td>

    <td className="text-center shrink-col text-body-secondary">
      {parameters.isCompilationPipeline && (
        <Icon
          icon="cogs"
          tooltipId={`${id}-compilation`}
          tooltipPlacement="bottom"
          tooltip={
            <FormattedMessage id="app.pipelinesList.compilationIconTooltip" defaultMessage="Compilation pipeline" />
          }
        />
      )}
      {parameters.isExecutionPipeline && !parameters.judgeOnlyPipeline && (
        <Icon
          icon="bolt"
          tooltipId={`${id}-execution`}
          tooltipPlacement="bottom"
          tooltip={
            <FormattedMessage
              id="app.pipelinesList.executionIconTooltip"
              defaultMessage="Execution (testing) pipeline"
            />
          }
        />
      )}
      {parameters.judgeOnlyPipeline && (
        <Icon
          icon="balance-scale"
          tooltipId={`${id}-judgeOnly`}
          tooltipPlacement="bottom"
          tooltip={
            <FormattedMessage id="app.pipelinesList.judgeOnlyIconTooltip" defaultMessage="Judge-only pipeline" />
          }
        />
      )}
    </td>

    <td className="text-center shrink-col text-body-secondary">
      {parameters.producesStdout && (
        <Icon
          icon="align-left"
          gapRight={2}
          tooltipId={`${id}-stdout`}
          tooltipPlacement="bottom"
          tooltip={
            <FormattedMessage
              id="app.pipelinesList.stdoutIconTooltip"
              defaultMessage="Tested solution is expected to yield results to standard output"
            />
          }
        />
      )}
      {parameters.producesFiles && (
        <Icon
          icon={['far', 'file-alt']}
          gapRight={2}
          tooltipId={`${id}-file`}
          tooltipPlacement="bottom"
          tooltip={
            <FormattedMessage
              id="app.pipelinesList.fileIconTooltip"
              defaultMessage="Tested solution is expected to yield results into a specific file"
            />
          }
        />
      )}
    </td>

    <td
      className={classnames({
        'fw-bold': true,
        'w-100': fullWidthName,
      })}>
      <Link to={PIPELINE_URI_FACTORY(id)}>{name}</Link>
    </td>

    {showAuthor && <td>{author ? <UsersNameContainer userId={author} link listItem /> : <i>ReCodEx</i>}</td>}

    {showCreatedAt && (
      <td>
        <DateTime unixts={createdAt} showRelative />
      </td>
    )}

    <td className="text-end text-nowrap">{createActions && createActions(id)}</td>
  </tr>
);

PipelinesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string,
  parameters: PropTypes.object,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  showAuthor: PropTypes.bool,
  showCreatedAt: PropTypes.bool,
  fullWidthName: PropTypes.bool,
  createActions: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(PipelinesListItem);
