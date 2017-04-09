import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Box from '../../AdminLTE/Box';

const CompilationLogs = (
  {
    initiationOutputs
  }
) => (
  <Box
    title={
      <FormattedMessage
        id="app.evaluationDetail.title.compilationLogs"
        defaultMessage="Compilation logs"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={false}
  >
    <pre>
      {initiationOutputs}
    </pre>
  </Box>
);

CompilationLogs.propTypes = {
  initiationOutputs: PropTypes.string.isRequired
};

export default CompilationLogs;
