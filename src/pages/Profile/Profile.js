import React, { Component } from 'react';
import { connect } from 'react-redux';

class Profile extends Component {

  componentWillMount() {
    Profile.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.userId !== newProps.params.userId) {
      Profile.loadData(newProps);
    }
  }

  static loadData = ({ userId, loadUserIfNeeded }) => {
    loadUserIfNeeded(userId);
  };

  render() {
    const {
      user
    } = this.props;

    return (
      <div>

      </div>
    );
  }

}

export default connect()(Profile);
