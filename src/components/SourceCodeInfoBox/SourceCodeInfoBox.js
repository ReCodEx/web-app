import React, { PropTypes } from 'react';
import { SimpleInfoBox } from '../AdminLTE/InfoBox';
import prettyBytes from 'pretty-bytes';

const SourceCodeInfoBox = ({
  id,
  name,
  size,
  uploadedAt
}) => (
  <SimpleInfoBox
    title={name}
    description={prettyBytes(size)}
    icon="file-code-o" />
);

SourceCodeInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired
};

export default SourceCodeInfoBox;
