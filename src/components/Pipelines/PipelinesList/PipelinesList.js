import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';

import PipelinesListItem from '../PipelinesListItem';

const PipelinesList = ({
  pipelines = [],
  heading = null,
  createActions,
  intl: { locale }
}) =>
  <Table hover>
    {Boolean(heading) &&
      <thead>
        {heading}
      </thead>}

    <tbody>
      {pipelines.map((pipeline, idx) =>
        <PipelinesListItem
          {...pipeline}
          createActions={createActions}
          key={pipeline ? pipeline.id : idx}
        />
      )}

      {pipelines.length === 0 &&
        <tr>
          <td className="text-center" colSpan={7}>
            <FormattedMessage
              id="app.pipelinesList.empty"
              defaultMessage="There are no pipelines in this list."
            />
          </td>
        </tr>}
    </tbody>
  </Table>;

PipelinesList.propTypes = {
  pipelines: PropTypes.array,
  heading: PropTypes.any,
  createActions: PropTypes.func,
  intl: intlShape.isRequired
};

export default injectIntl(PipelinesList);
