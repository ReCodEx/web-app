import React, { PropTypes, Component } from 'react';
import Icon from 'react-fontawesome';
import classNames from 'classnames';
import Collapse from 'react-collapse';

class Box extends Component {

  componentWillMount() {
    const { isOpen = true } = this.props;
    this.setState({ isOpen });
  }

  componentWillReceiveProps(newProps) {
    if (newProps !== this.props) {
      this.setState({ isOpen: newProps.isOpen });
    }
  }

  toggleDetails = () => {
    if (this.state.isOpen) {
      this.hideDetails();
    } else {
      this.showDetails();
    }
  };

  showDetails = () => this.setState({ isOpen: true });
  hideDetails = () => this.setState({ isOpen: false });

  render() {
    const {
      title,
      type,
      noPadding = true,
      children,
      footer,
      collapsable = false
    } = this.props;
    const { isOpen = true } = this.state;

    return (
      <div className={
        classNames({
          'box': true,
          [`box-${type}`]: typeof type !== 'undefined'
        })
      }>
        <div className='box-header with-border'>
          <h3 className='box-title'>{title}</h3>
          {collapsable && (
            <div className='box-tools pull-right'>
              <button type='button' className='btn btn-box-tool' onClick={this.toggleDetails}>
                <Icon name={isOpen ? 'minus' : 'plus'} />
              </button>
            </div>
          )}
        </div>
        <Collapse isOpened={isOpen}>
          <div className={
            classNames({
              'box-body': true,
              'no-padding': noPadding
            })
          }>
            {children}
          </div>
        </Collapse>
        {footer &&
          <div className={'box-footer'}>
            {footer}
          </div>}
      </div>
    );
  }

}

Box.propTypes = {
  title: PropTypes.oneOfType([ PropTypes.string, PropTypes.object ]).isRequired,
  type: PropTypes.string,
  isOpen: PropTypes.bool,
  collapsable: PropTypes.bool
};

export default Box;
