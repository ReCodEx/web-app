import React from 'react';
import Comment from './Comment.js';

const SomebodyElsesComment = props => <Comment {...props} right={false} />;

export default SomebodyElsesComment;
