import React, { Component, PropTypes } from 'react';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';

class AddComment extends Component {

  state = { text: '' };
  changeText = (text) => this.setState({ text });
  addComment = e => {
    e.preventDefault();
    const { text } = this.state;
    const { addComment } = this.props;
    addComment(text);
    this.setState({ text: '' });
  };

  render() {
    const { text } = this.state;
    const { addComment } = this.props;

    return (
      <Form>
        <InputGroup>
          <FormControl
            type='text'
            onChange={e => this.changeText(e.target.value)}
            placeholder='Váš komentář ...'
            value={text} />
          <InputGroup.Button>
            <Button
              type='submit'
              bsStyle='success'
              disabled={text.length === 0}
              className='btn-flat'
              onClick={this.addComment}>
              Odeslat
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </Form>
    );
  }

}

AddComment.propTypes = {
  addComment: PropTypes.func.isRequired
};

export default AddComment;
