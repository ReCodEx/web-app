import React, { PropTypes } from 'react';
import ReactMarkdown from 'react-markdown';
import { FormattedMessage } from 'react-intl';
import { ListGroupItem, Clearfix } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { Link } from 'react-router';

const LoadingExercisesListItem = ({
  createActions
}) => (
  <tr>
    <td colSpan={createActions ? 3 : 2}>
      <LoadingIcon /> <FormattedMessage id='app.exercisesListItem.loading' defaultMessage='Loading ...' />
    </td>
  </tr>
);

LoadingExercisesListItem.propTypes = {};

export default LoadingExercisesListItem;
