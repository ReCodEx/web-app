import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import Markdown from '../../widgets/Markdown';
import DateTime from '../../widgets/DateTime';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';

const PipelineDetail = ({
  author,
  exerciseId,
  name,
  description = '',
  createdAt,
  updatedAt,
  version
}) =>
  <Box title={name} noPadding>
    <Table>
      <tbody>
        {Boolean(author) &&
          <tr>
            <th>
              <FormattedMessage id="generic.author" defaultMessage="Author" />:
            </th>
            <td>
              <UsersNameContainer userId={author} />
            </td>
          </tr>}
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.description"
              defaultMessage="Author's description:"
            />
          </th>
          <td>
            <Markdown source={description} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.exercise"
              defaultMessage="Exercise:"
            />
          </th>
          <td>
            {exerciseId
              ? <ExercisesNameContainer exerciseId={exerciseId} />
              : <i>
                  <FormattedMessage
                    id="app.pipeline.publicExercise"
                    defaultMessage="Public"
                  />
                </i>}
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.createdAt"
              defaultMessage="Created at"
            />:
          </th>
          <td>
            <DateTime unixts={createdAt} showRelative />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.updatedAt"
              defaultMessage="Last updated at"
            />:
          </th>
          <td>
            <DateTime unixts={updatedAt} showRelative />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.version"
              defaultMessage="Version:"
            />
          </th>
          <td>
            v<FormattedNumber value={version} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>;

PipelineDetail.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  author: PropTypes.string,
  exerciseId: PropTypes.string,
  description: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired
};

export default PipelineDetail;
