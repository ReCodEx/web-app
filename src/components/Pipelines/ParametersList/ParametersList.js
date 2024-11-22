import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

const pipelineParams = {
  isCompilationPipeline: (
    <FormattedMessage id="app.pipelineParams.isCompilationPipeline" defaultMessage="Compilation pipeline" />
  ),
  isExecutionPipeline: (
    <FormattedMessage id="app.pipelineParams.isExecutionPipeline" defaultMessage="Execution pipeline" />
  ),
  judgeOnlyPipeline: (
    <FormattedMessage id="app.pipelineParams.judgeOnlyPipeline" defaultMessage="Judge-only pipeline" />
  ),
  producesStdout: (
    <FormattedMessage
      id="app.pipelineParams.producesStdout"
      defaultMessage="Tested solution is expected to yield results to standard output"
    />
  ),
  producesFiles: (
    <FormattedMessage
      id="app.pipelineParams.producesFiles"
      defaultMessage="Tested solution is expected to yield results into a specific file"
    />
  ),
  hasEntryPoint: (
    <FormattedMessage
      id="app.pipelineParams.hasEntryPoint"
      defaultMessage="Tested solution is expected to specify entry point of the application"
    />
  ),
  hasExtraFiles: (
    <FormattedMessage
      id="app.pipelineParams.hasExtraFiles"
      defaultMessage="Extra source files can be added to tested solution"
    />
  ),
  hasSuccessExitCodes: (
    <FormattedMessage
      id="app.pipelineParams.hasSuccessExitCodes"
      defaultMessage="Configurable exit-codes that are accepted as a success when tested soution is executed"
    />
  ),
};

const pipelineParameterMapping = parameter => {
  if (pipelineParams[parameter]) {
    return pipelineParams[parameter];
  } else {
    return parameter;
  }
};

const ParametersList = ({ parameters }) => (
  <Table className="my-0">
    <tbody>
      {Object.keys(parameters).map(parameterName => (
        <tr key={parameterName}>
          <td className="shrink-col">
            <i>{pipelineParameterMapping(parameterName)}</i>:
          </td>
          <td className="ps-3">
            <code>{String(parameters[parameterName])}</code>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

ParametersList.propTypes = {
  parameters: PropTypes.object.isRequired,
};

export default ParametersList;
