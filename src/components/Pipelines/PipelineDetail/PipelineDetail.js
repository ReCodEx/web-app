import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  FormattedDate
} from 'react-intl';
import ReactMarkdown from 'react-markdown';
import { Table } from 'react-bootstrap';
import Box from '../../widgets/Box';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';

const PipelineDetail = ({
  id,
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
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.author"
              defaultMessage="Author:"
            />
          </th>
          <td>
            <UsersNameContainer userId={author} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.description"
              defaultMessage="Author's description:"
            />
          </th>
          <td>
            <ReactMarkdown source={description} />
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
              defaultMessage="Created at:"
            />
          </th>
          <td>
            <FormattedDate value={createdAt * 1000} />{' '}
            <FormattedTime value={createdAt * 1000} />
          </td>
        </tr>
        <tr>
          <th>
            <FormattedMessage
              id="app.pipeline.updatedAt"
              defaultMessage="Last updateded at:"
            />
          </th>
          <td>
            <FormattedDate value={updatedAt * 1000} />{' '}
            <FormattedTime value={updatedAt * 1000} />
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
  author: PropTypes.string.isRequired,
  exerciseId: PropTypes.string,
  description: PropTypes.string,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired
};

export default PipelineDetail;
