import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup
} from 'react-bootstrap';
import { LoadingIcon, SearchIcon, WarningIcon } from '../../icons';

class SimpleTextSearch extends Component {
  state = { query: this.props.query };

  queryChangeHandler = ev => {
    this.setState({ query: ev.target.value });
  };

  componentWillReceiveProps(newProps) {
    if (this.props.query !== newProps.query) {
      this.setState({ query: newProps.query });
    }
  }

  render() {
    const {
      id = 'simpleTextSearch',
      onSubmit,
      isLoading,
      hasFailed
    } = this.props;

    return (
      <form>
        <FormGroup>
          <ControlLabel htmlFor={id}>
            <FormattedMessage id="generic.search" defaultMessage="Search" />:
          </ControlLabel>
          <InputGroup>
            <FormControl
              id={id}
              type="text"
              value={this.state.query}
              onChange={this.queryChangeHandler}
            />
            <InputGroup.Button>
              <Button
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  onSubmit(this.state.query);
                }}
                disabled={isLoading}
              >
                {isLoading && <LoadingIcon />}
                {hasFailed && <WarningIcon />}
                {!isLoading && !hasFailed && <SearchIcon />}
              </Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>
      </form>
    );
  }
}

SimpleTextSearch.propTypes = {
  id: PropTypes.string,
  query: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  hasFailed: PropTypes.bool
};

export default SimpleTextSearch;
