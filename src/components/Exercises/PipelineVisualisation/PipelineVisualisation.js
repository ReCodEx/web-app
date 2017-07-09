import React from 'react';
import PropTypes from 'prop-types';

import { convertGraphToSvg } from '../../../helpers/dot';
import style from './pipeline.less';

const PipelineVisualisation = ({ graph, variables }) => {
  const svg = convertGraphToSvg(graph, variables);
  return (
    <div className={style.pipeline} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

PipelineVisualisation.propTypes = {
  graph: PropTypes.object.isRequired,
  variables: PropTypes.array.isRequired
};

export default PipelineVisualisation;
