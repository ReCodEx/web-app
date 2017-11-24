import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditExerciseConfigTests from './EditExerciseSimpleConfigTests';

const EditExerciseSimpleConfigEnvironment = ({ formValues, ...props }) =>
  <TabbedArrayField
    {...props}
    getTitle={i =>
      formValues.config &&
      formValues.config[i] &&
      formValues.config[i].runtimeEnvironmentId
        ? formValues.config[i].runtimeEnvironmentId
        : <FormattedMessage
            id="app.editExerciseSimpleConfigEnvironment.newEnvironment"
            defaultMessage="New environment"
          />}
    ContentComponent={EditExerciseConfigTests}
    emptyMessage={
      <FormattedMessage
        id="app.editExerciseSimpleConfigEnvironment.emptyConfigTabs"
        defaultMessage="There is currently no runtime configuration."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editExerciseSimpleConfigEnvironment.addConfigTab"
        defaultMessage="Add new runtime configuration"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editExerciseSimpleConfigEnvironment.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this runtime configuration?"
      />
    }
    id="exercise-simple-config-tabs"
    add
    remove
  />;

EditExerciseSimpleConfigEnvironment.propTypes = {
  formValues: PropTypes.object
};

export default EditExerciseSimpleConfigEnvironment;
