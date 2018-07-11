import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import { Link } from 'react-router';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';

import Icon from '../../icons';
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
      <Icon icon="random" className={author ? 'text-muted' : 'text-primary'} />
    </td>
    <td className="text-center shrink-col text-muted">
      {parameters.isCompilationPipeline && <Icon icon="cogs" />}
      {parameters.isExecutionPipeline &&
        !parameters.judgeOnlyPipeline &&
        <Icon icon="bolt" />}
      {parameters.judgeOnlyPipeline && <Icon icon="balance-scale" />}
    </td>
    <td className="text-center shrink-col text-muted">
      {parameters.producesStdout && <Icon icon="align-left" gapRight />}
      {parameters.producesFiles && <Icon icon={['far', 'file-alt']} gapRight />}
    </td>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>
          {name}
        </Link>
      </strong>
    </td>
    <td>
      {author
        ? <UsersNameContainer userId={author} />
        : <i>
            <FormattedMessage
              id="app.pipelinesList.universalPipeline"
              defaultMessage="universal pipeline"
            />
          </i>}
    </td>
    <td>
      <FormattedDate value={createdAt * 1000} />&nbsp;&nbsp;
      <FormattedTime value={createdAt * 1000} />
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
