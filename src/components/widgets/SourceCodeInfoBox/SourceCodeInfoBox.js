import React from 'react';
import PropTypes from 'prop-types';
import { SimpleInfoBox } from '../InfoBox';
import prettyBytes from 'pretty-bytes';

const SourceCodeInfoBox = ({ id, name, size, uploadedAt }) =>
  <SimpleInfoBox
    title={name}
    description={prettyBytes(size)}
    icon="file-code-o"
  />;

SourceCodeInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired
};

export default SourceCodeInfoBox;
