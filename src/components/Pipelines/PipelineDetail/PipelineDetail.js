import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import PipelineNameContainer from '../../../containers/PipelineNameContainer';
import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import Icon, { UserIcon, CodeIcon, ForkIcon } from '../../icons';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import Version from '../../widgets/Version/Version.js';
import ParametersList from '../ParametersList/ParametersList.js';

const PipelineDetail = ({
  author,
  description = '',
  createdAt,
  updatedAt,
  version,
  runtimeEnvironments,
  parameters,
  forkedFrom = null,
}) => (
  <Box
    title={<FormattedMessage id="app.pipeline.properties" defaultMessage="Pipeline properties" />}
    noPadding
    unlimitedHeight>
    <Table responsive size="sm" className="card-table">
      <tbody>
        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <UserIcon />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            {author ? (
              <UsersNameContainer userId={author} link />
            ) : (
              <i className="text-body-secondary">
                ReCodEx
                <Explanation id="no-author">
                  <FormattedMessage
                    id="app.pipeline.noAuthorExplanation"
                    defaultMessage="This is a system pipeline. There is no explicit author."
                  />
                </Explanation>
              </i>
            )}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <Icon icon={['far', 'file-alt']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.pipeline.description" defaultMessage="Description" />:
          </th>
          <td>
            <Markdown source={description} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <CodeIcon />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.pipeline.runtimes" defaultMessage="Runtime environments" />:
          </th>
          <td>
            <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <Icon icon="stream" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.pipeline.parameters" defaultMessage="Parameters" />:
          </th>
          <td>
            <ParametersList parameters={parameters} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:
          </th>
          <td>
            <DateTime unixTs={createdAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col px-2 text-body-secondary">
            <Icon icon={['far', 'copy']} />
          </td>
          <th>
            <FormattedMessage id="app.pipeline.version" defaultMessage="Version" />:
          </th>
          <td>
            <Version version={version} createdAt={createdAt} updatedAt={updatedAt} />
          </td>
        </tr>

        {forkedFrom && (
          <tr>
            <td className="text-center shrink-col px-2 text-body-secondary">
              <ForkIcon />
            </td>
            <th>
              <FormattedMessage id="app.pipeline.forkedFrom" defaultMessage="Forked from" />:
            </th>
            <td>
              <PipelineNameContainer pipelineId={forkedFrom} />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

PipelineDetail.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string,
  forkedFrom: PropTypes.string,
  description: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  parameters: PropTypes.object.isRequired,
};

export default PipelineDetail;
