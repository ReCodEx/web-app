import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import DateTime from '../../widgets/DateTime';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import Icon, { UserIcon, CodeIcon } from '../../icons';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import Version from '../../widgets/Version/Version';
import ParametersList from '../ParametersList/ParametersList';

const PipelineDetail = ({
  author,
  exercisesIds,
  name,
  description = '',
  createdAt,
  updatedAt,
  version,
  runtimeEnvironments,
  parameters,
}) => (
  <Box title={name} noPadding unlimitedHeight>
    <Table responsive condensed>
      <tbody>
        {Boolean(author) && (
          <tr>
            <td className="text-center shrink-col em-padding-left em-padding-right">
              <UserIcon />
            </td>
            <th>
              <FormattedMessage id="generic.author" defaultMessage="Author" />:
            </th>
            <td>
              <UsersNameContainer userId={author} />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'file-alt']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.pipeline.description" defaultMessage="Pipeline overview:" />
          </th>
          <td>
            <Markdown source={description} />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon="stethoscope" />
          </td>
          <th>
            <FormattedMessage id="app.pipeline.exercises" defaultMessage="Exercises:" />
          </th>
          <td>
            {exercisesIds.length !== 0 ? (
              exercisesIds.map(exerciseId => (
                <div key={exerciseId}>
                  <ExercisesNameContainer exerciseId={exerciseId} />
                </div>
              ))
            ) : (
              <i>
                <FormattedMessage id="app.pipeline.publicExercise" defaultMessage="Public" />
              </i>
            )}
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
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
          <td className="text-center shrink-col em-padding-left em-padding-right">
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
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage id="app.pipeline.createdAt" defaultMessage="Created at" />:
          </th>
          <td>
            <DateTime unixts={createdAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center shrink-col em-padding-left em-padding-right">
            <Icon icon={['far', 'copy']} />
          </td>
          <th>
            <FormattedMessage id="app.pipeline.version" defaultMessage="Version:" />
          </th>
          <td>
            <Version version={version} createdAt={createdAt} updatedAt={updatedAt} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

PipelineDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  author: PropTypes.string,
  exercisesIds: PropTypes.array.isRequired,
  description: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  parameters: PropTypes.object.isRequired,
};

export default PipelineDetail;
