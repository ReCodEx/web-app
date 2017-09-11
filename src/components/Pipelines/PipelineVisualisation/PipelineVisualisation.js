import React from 'react';
import PropTypes from 'prop-types';

import { convertGraphToSvg } from '../../../helpers/dot';
import ClientOnly from '../../../components/helpers/ClientOnly';
import { canUseDOM } from 'exenv';
import style from './pipeline.less';

const PipelineVisualisation = ({ graph }) => {
  let svg = '';
  if (canUseDOM) {
    svg = convertGraphToSvg(graph);
  }
  return (
    <ClientOnly>
      <div
        className={style.pipeline}
        dangerouslySetInnerHTML={{
          __html: svg
        }}
      />
    </ClientOnly>
  );
};

PipelineVisualisation.propTypes = {
  graph: PropTypes.object
};

export default PipelineVisualisation;
