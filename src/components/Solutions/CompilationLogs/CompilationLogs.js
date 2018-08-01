import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';

const CompilationLogs = ({ initiationOutputs }) =>
  <Box
    title={
      <FormattedMessage
        id="app.evaluationDetail.title.compilationLogs"
        defaultMessage="Compilation Logs"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={initiationOutputs.trim() !== ''}
  >
    <pre>
      {initiationOutputs.trim()}
    </pre>
  </Box>;

CompilationLogs.propTypes = {
  initiationOutputs: PropTypes.string.isRequired
};

export default CompilationLogs;
