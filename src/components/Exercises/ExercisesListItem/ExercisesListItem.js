import React, { PropTypes } from 'react';
import ReactMarkdown from 'react-markdown';
import { ListGroupItem, Clearfix } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';

const ExercisesListItem = ({
  id,
  name,
  createActions
}, {
  links: { EXERCISE_URI_FACTORY }
}) => (
  <tr>
    <td>
      <p><strong>{name}</strong></p>
      <small><Link to={EXERCISE_URI_FACTORY(id)}>{id}</Link></small>
    </td>
    {createActions && (
      <td className='text-right'>
        {createActions(id)}
      </td>
    )}
  </tr>
);

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

ExercisesListItem.contextTypes = {
  links: PropTypes.object
};

export default ExercisesListItem;
