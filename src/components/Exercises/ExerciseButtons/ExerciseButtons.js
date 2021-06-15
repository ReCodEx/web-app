import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Button from '../../widgets/TheButton';
import { EditIcon, GroupIcon, LimitsIcon, TestsIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const ExerciseButtons = ({
  id: exerciseId,
  permissionHints,
  links: {
    EXERCISE_ASSIGNMENTS_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
  },
}) => (
  <div className="em-margin-bottom em-margin-right">
    <ButtonGroup>
      <Link to={EXERCISE_ASSIGNMENTS_URI_FACTORY(exerciseId)}>
        <Button variant="primary" size="sm">
          <GroupIcon gapRight />
          <FormattedMessage id="app.exercise.assignments" defaultMessage="Assignments in Groups" />
        </Button>
      </Link>

      {permissionHints && permissionHints.update && (
        <Link to={EXERCISE_EDIT_URI_FACTORY(exerciseId)}>
          <Button variant="warning" size="sm">
            <EditIcon gapRight />
            <FormattedMessage id="app.exercise.editSettings" defaultMessage="Exercise Settings" />
          </Button>
        </Link>
      )}

      {permissionHints && permissionHints.viewPipelines && permissionHints.viewScoreConfig && (
        <Link to={EXERCISE_EDIT_CONFIG_URI_FACTORY(exerciseId)}>
          <Button variant={permissionHints.setScoreConfig ? 'warning' : 'secondary'} size="sm">
            <TestsIcon gapRight />
            <FormattedMessage id="app.exercise.editConfig" defaultMessage="Tests Configuration" />
          </Button>
        </Link>
      )}

      {permissionHints && permissionHints.viewLimits && (
        <Link to={EXERCISE_EDIT_LIMITS_URI_FACTORY(exerciseId)}>
          <Button variant={permissionHints.setLimits ? 'warning' : 'secondary'} size="sm">
            <LimitsIcon gapRight />
            <FormattedMessage id="app.exercise.editLimits" defaultMessage="Tests Limits" />
          </Button>
        </Link>
      )}
    </ButtonGroup>
  </div>
);

ExerciseButtons.propTypes = {
  id: PropTypes.string.isRequired,
  configurationType: PropTypes.string.isRequired,
  permissionHints: PropTypes.object,
  links: PropTypes.object,
};

export default withLinks(ExerciseButtons);
