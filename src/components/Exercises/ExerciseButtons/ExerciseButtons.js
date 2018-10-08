import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Button from '../../widgets/FlatButton';
import { EditIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const ExerciseButtons = ({
  id: exerciseId,
  permissionHints,
  links: {
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY
  }
}) =>
  <div className="em-margin-bottom em-margin-right">
    <ButtonGroup>
      {permissionHints &&
        permissionHints.update &&
        <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}>
          <Button bsStyle="warning" bsSize="sm">
            <EditIcon />
            &nbsp;
            <FormattedMessage
              id="app.exercise.editSettings"
              defaultMessage="Exercise Settings"
            />
          </Button>
        </LinkContainer>}

      {permissionHints &&
        permissionHints.viewPipelines &&
        permissionHints.viewScoreConfig &&
        <LinkContainer to={EXERCISE_EDIT_CONFIG_URI_FACTORY(exerciseId)}>
          <Button
            bsStyle={permissionHints.setScoreConfig ? 'warning' : 'default'}
            bsSize="sm"
          >
            <EditIcon gapRight />
            <FormattedMessage
              id="app.exercise.editConfig"
              defaultMessage="Tests Configuration"
            />
          </Button>
        </LinkContainer>}

      {permissionHints &&
        permissionHints.viewLimits &&
        <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId)}>
          <Button
            bsStyle={permissionHints.setLimits ? 'warning' : 'default'}
            bsSize="sm"
          >
            <EditIcon />
            &nbsp;
            <FormattedMessage
              id="app.exercise.editLimits"
              defaultMessage="Tests Limits"
            />
          </Button>
        </LinkContainer>}
    </ButtonGroup>
  </div>;

ExerciseButtons.propTypes = {
  id: PropTypes.string.isRequired,
  configurationType: PropTypes.string.isRequired,
  permissionHints: PropTypes.object,
  links: PropTypes.object
};

export default withLinks(ExerciseButtons);
