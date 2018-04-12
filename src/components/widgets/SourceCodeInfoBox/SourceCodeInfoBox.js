import React from 'react';
import PropTypes from 'prop-types';
import { SimpleInfoBox } from '../InfoBox';
import { prettyPrintBytes } from '../../helpers/stringFormatters';

const SourceCodeInfoBox = ({ id, name, size, uploadedAt }) =>
  <SimpleInfoBox
    title={name}
    description={prettyPrintBytes(size)}
    icon={['far', 'file-code']}
  />;

SourceCodeInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired
};

export default SourceCodeInfoBox;
