import React from 'react';
import PropTypes from 'prop-types';
import pipelineParameterMapping from '../../helpers/pipelineParameterMapping';

const ParametersList = ({ parameters }) =>
  Object.keys(parameters).map(parameterName =>
    <div key={parameterName}>
      <i>{pipelineParameterMapping(parameterName)}</i>:{' '}
      <code>{String(parameters[parameterName])}</code>
    </div>
  );

ParametersList.propTypes = {
  parameters: PropTypes.object.isRequired
};

export default ParametersList;
