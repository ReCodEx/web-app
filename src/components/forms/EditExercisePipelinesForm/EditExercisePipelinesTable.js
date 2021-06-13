import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, FormControl, ControlLabel } from 'react-bootstrap';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import Button from '../../widgets/FlatButton';
import PipelinesListItem from '../../Pipelines/PipelinesListItem';
import { AddIcon, DeleteIcon, TransferIcon } from '../../icons';
import { EMPTY_FNC } from '../../../helpers/common';

class EditExercisePipelinesTable extends Component {
  state = { selectedPipeline: null };

  createActions = idx => () => {
    const { fields } = this.props;
    return (
      <React.Fragment>
        {idx > 0 && (
          <Button
            onClick={() => fields.swap(idx - 1, idx)}
            variant="warning"
            bsSize="xs"
            style={{ position: 'relative', top: '-20px', marginRight: '1em' }}>
            <TransferIcon rotation={90} />
          </Button>
        )}
        <Button onClick={() => fields.remove(idx)} variant="danger" bsSize="xs">
          <DeleteIcon />
        </Button>
      </React.Fragment>
    );
  };

  renderRow = (unused, idx, fields) => {
    const { pipelines, readOnly = false } = this.props;
    const pipelineId = fields.get(idx);
    const pipeline = pipelines.find(({ id }) => id === pipelineId);
    return pipeline ? (
      <PipelinesListItem
        {...pipeline}
        createActions={readOnly ? EMPTY_FNC : this.createActions(idx)}
        fullWidthName
        key={`${pipelineId}-${idx}`}
      />
    ) : null;
  };

  render() {
    const {
      fields,
      pipelines,
      readOnly = false,
      intl: { locale },
    } = this.props;

    return (
      <Table>
        <tbody>
          {fields.map(this.renderRow)}

          {!readOnly && (
            <tr>
              <td colSpan={4} className="full-width">
                <ControlLabel>
                  <FormattedMessage
                    id="app.editExercisePipelines.availablePipelines"
                    defaultMessage="Available pipelines"
                  />
                  :
                </ControlLabel>
                <FormControl
                  as="select"
                  onChange={e => this.setState({ selectedPipeline: e.target.value })}
                  value={this.state.selectedPipeline || ''}>
                  <option value={null} />
                  {pipelines
                    .sort((a, b) => a.name.localeCompare(b.name, locale))
                    .map(({ id, name }) => (
                      <option value={id} key={id}>
                        {name}
                      </option>
                    ))}
                </FormControl>
              </td>
              <td className="valign-bottom">
                <Button
                  onClick={() => {
                    if (this.state.selectedPipeline) {
                      fields.push(this.state.selectedPipeline);
                      this.setState({ selectedPipeline: null });
                    }
                  }}
                  variant="primary"
                  disabled={!this.state.selectedPipeline}>
                  <AddIcon gapRight />
                  <FormattedMessage id="app.editExercisePipelines.addPipeline" defaultMessage="Add Pipeline" />
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }
}

EditExercisePipelinesTable.propTypes = {
  readOnly: PropTypes.bool,
  fields: PropTypes.object.isRequired,
  pipelines: PropTypes.array,
  intl: intlShape.isRequired,
};

export default injectIntl(EditExercisePipelinesTable);
