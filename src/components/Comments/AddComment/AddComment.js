import React, { Component, PropTypes } from 'react';
import { Button, Form, FormGroup, FormControl, InputGroup, HelpBlock } from 'react-bootstrap';
import Icon from 'react-fontawesome';

class AddComment extends Component {

  state = { text: '', isPrivate: true };

  changeText = (text) => this.setState({ text });
  togglePrivate = () => this.setState({ isPrivate: !this.state.isPrivate });

  addComment = e => {
    e.preventDefault();
    const { text, isPrivate } = this.state;
    const { addComment } = this.props;
    addComment(text, isPrivate);
    this.setState({ text: '' });
  };

  render() {
    const { text, isPrivate } = this.state;
    const { addComment } = this.props;

    return (
      <Form>
        <FormGroup bsSize='large'>
          <InputGroup>
            <InputGroup.Addon>
              <Button className='btn-flat' onClick={this.togglePrivate} bsSize='xs'>
                {isPrivate ? <Icon name='lock' className='text-success' /> : <Icon name='unlock-alt' className='text-warning' />}
              </Button>
            </InputGroup.Addon>
            <FormControl
              type='text'
              onChange={e => this.changeText(e.target.value)}
              placeholder='Váš komentář ...'
              value={text} />
            <InputGroup.Button>
              <Button
                type='submit'
                bsStyle={isPrivate ? 'success' : 'primary'}
                bsSize='large'
                disabled={text.length === 0}
                className='btn-flat'
                onClick={this.addComment}>
                Odeslat
              </Button>
            </InputGroup.Button>
          </InputGroup>
          {isPrivate &&
            <HelpBlock>Tento komentář uvidíte pouze vy. Pokud chcete, aby byl veřejný, klikěte na tlačítko s ikonou zámku.</HelpBlock>}
          {!isPrivate &&
            <HelpBlock>Tento komentář <strong>uvidí všichni návštěvnící této stránky</strong>. Pokud chcete, aby byl soukromý, klikěte na tlačítko s ikonou zámku.</HelpBlock>}
        </FormGroup>
      </Form>
    );
  }

}

AddComment.propTypes = {
  addComment: PropTypes.func.isRequired
};

export default AddComment;
