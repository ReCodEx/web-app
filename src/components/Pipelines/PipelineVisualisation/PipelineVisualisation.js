import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { convertGraphToSvg } from '../../../helpers/dot';
import { canUseDOM } from 'exenv';
import style from './pipeline.less';
import { LoadingIcon } from '../../icons';

const PipelineVisualisation = ({ graph }) => {
  if (canUseDOM) {
    const [svg, setSvg] = useState(null);
    useEffect(() => {
      setSvg(null);
      convertGraphToSvg(graph).then(result => setSvg(result));
    }, [graph]);

    return svg !== null ? (
      <div
        className={style.pipeline}
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
    ) : (
      <div>
        <LoadingIcon gapRight />
        <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
      </div>
    );
  } else {
    return <div></div>;
  }
};

PipelineVisualisation.propTypes = {
  graph: PropTypes.object,
};

export default PipelineVisualisation;
