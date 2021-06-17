import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap';
import { LoadingIcon, SearchIcon, WarningIcon } from '../../icons';
import Button from '../../widgets/TheButton';

class SimpleTextSearch extends Component {
  state = { query: this.props.query, lastPropsQuery: this.props.query };

  queryChangeHandler = ev => {
    this.setState({ query: ev.target.value });
  };

  static getDerivedStateFromProps(props, state) {
    return props.query !== state.lastPropsQuery ? { query: props.query, lastPropsQuery: props.query } : null;
  }

  render() {
    const { id = 'simpleTextSearch', onSubmit, isLoading, hasFailed } = this.props;

    return (
      <form>
        <FormGroup>
          <FormLabel htmlFor={id}>
            <FormattedMessage id="generic.search" defaultMessage="Search" />:
          </FormLabel>
          <InputGroup>
            <FormControl id={id} type="text" value={this.state.query} onChange={this.queryChangeHandler} />
            <InputGroup.Append>
              <Button
                variant="secondary"
                type="submit"
                onClick={e => {
                  e.preventDefault();
                  onSubmit(this.state.query);
                }}
                disabled={isLoading}>
                {isLoading && <LoadingIcon />}
                {hasFailed && <WarningIcon />}
                {!isLoading && !hasFailed && <SearchIcon />}
              </Button>
            </InputGroup.Append>
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
  hasFailed: PropTypes.bool,
};

export default SimpleTextSearch;
