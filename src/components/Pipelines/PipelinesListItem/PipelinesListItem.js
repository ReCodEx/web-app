import React from 'react';
import PropTypes from 'prop-types';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import { Link } from 'react-router';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';

import Icon from '../../icons';
import withLinks from '../../../helpers/withLinks';

const PipelinesListItem = ({
  id,
  name,
  author,
  exerciseId,
  createdAt,
  createActions,
  links: { PIPELINE_URI_FACTORY }
}) =>
  <tr>
    <td className="text-center">
      <Icon icon="code" />
    </td>
    <td>
      <strong>
        <Link to={PIPELINE_URI_FACTORY(id)}>
          {name}
        </Link>
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={author} />
    </td>
    <td>
      {exerciseId
        ? <ExercisesNameContainer exerciseId={exerciseId} />
        : <i>
            <FormattedMessage
              id="app.pipelinesListItem.exercise.public"
              defaultMessage="Public"
            />
          </i>}
    </td>
    <td>
      <FormattedDate value={createdAt * 1000} />{' '}
      <FormattedTime value={createdAt * 1000} />
    </td>
    {createActions &&
      <td className="text-right">
        {createActions(id)}
      </td>}
  </tr>;

PipelinesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  exerciseId: PropTypes.string,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  createActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(PipelinesListItem);
