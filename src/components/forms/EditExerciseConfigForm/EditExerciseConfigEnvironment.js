import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { TabbedArrayField } from '../Fields';
import EditExerciseConfigTests from './EditExerciseConfigTests';

const EditExerciseConfigEnvironment = ({ testConfigs, ...props }) => (
  <TabbedArrayField
    {...props}
    testConfigs={testConfigs}
    getTitle={i =>
      testConfigs && testConfigs[i] && testConfigs[i].name
        ? testConfigs[i].name
        : <FormattedMessage
            id="app.editExerciseConfigEnvironment.newConfig"
            defaultMessage="New configuration"
          />}
    ContentComponent={EditExerciseConfigTests}
    emptyMessage={
      <FormattedMessage
        id="app.editExerciseConfigEnvironment.emptyConfigTabs"
        defaultMessage="There is currently no runtime configuration."
      />
    }
    addMessage={
      <FormattedMessage
        id="app.editExerciseConfigEnvironment.addConfigTab"
        defaultMessage="Add new runtime configuration"
      />
    }
    removeQuestion={
      <FormattedMessage
        id="app.editExerciseConfigEnvironment.reallyRemoveQuestion"
        defaultMessage="Do you really want to delete this runtime configuration?"
      />
    }
    id="runtime-environments"
    // remove
    // add
  />
);

EditExerciseConfigEnvironment.propTypes = {
  testConfigs: PropTypes.array.isRequired
};

export default EditExerciseConfigEnvironment;
