import React, { PropTypes } from 'react';
import Highlight from 'react-highlight';
import addLineNumbers from 'add-line-numbers';

const SourceCodeViewer = ({
  name,
  content,
  lineNumbers = true
}) => (
  <div style={{
    tabSize: 2
  }}>
    <Highlight className={name.split('.').pop()}>
      {lineNumbers
        ? addLineNumbers(content, 1, '|\t')
        : content}
    </Highlight>
  </div>
);

export default SourceCodeViewer;
