import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Field, FieldArray } from 'redux-form';
import { TextField } from '../Fields';
import EditHardwareGroupLimits from '../EditHardwareGroupLimits';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const EditEnvironmentLimitsFields = ({
  prefix,
  i,
  environments,
  runtimeEnvironments
}) => {
  const { environment, limits, referenceSolutionsEvaluations } = environments[
    i
  ];
  const runtime = runtimeEnvironments
    ? runtimeEnvironments.get(environment.runtimeEnvironmentId)
    : null;

  return (
    <div>
      <ResourceRenderer resource={runtime}>
        {runtime =>
          <div>
            <h4>{runtime.name}</h4>
            <ul>
              <li>{runtime.language}</li>
              <li>{runtime.platform}</li>
              <li>{runtime.description}</li>
            </ul>
          </div>}
      </ResourceRenderer>

      <Field
        name={`${prefix}.environment.name`}
        component={TextField}
        label={
          <FormattedMessage
            id="app.editEnvironmentLimitsForm.environment.name"
            defaultMessage="Environment name:"
          />
        }
      />

      <FieldArray
        name={`${prefix}.limits`}
        limits={limits}
        referenceSolutionsEvaluations={referenceSolutionsEvaluations}
        component={EditHardwareGroupLimits}
      />
    </div>
  );
};

EditEnvironmentLimitsFields.propTypes = {
  prefix: PropTypes.string.isRequired,
  i: PropTypes.number,
  runtimeEnvironments: ImmutablePropTypes.map,
  environments: PropTypes.arrayOf(
    PropTypes.shape({
      referenceSolutionsEvaluations: PropTypes.object
    })
  ).isRequired
};

export default EditEnvironmentLimitsFields;
