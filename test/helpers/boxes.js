import { expect } from 'chai';
import {
  createBoxFromFormInputs,
  transformPipelineDataForApi
} from '../../src/helpers/boxes';

global.atob = b64Encoded => Buffer.from(b64Encoded, 'base64').toString();
global.Buffer = global.Buffer || require('buffer').Buffer;

describe('helpers', () => {
  describe('Boxes for pipelines editor', () => {
    it('must correctly transform input data to the data that can be sent to the server', () => {
      const data = {
        name: 'X',
        type: 'box-type-A',
        portsIn: {
          A: { type: '?' },
          B: { type: 'file' }
        },
        portsOut: {
          C: { type: '?' }
        }
      };
      const boxTypes = [
        {
          type: 'box-type-A',
          portsIn: {
            A: {
              type: 'file[]'
            },
            B: {
              type: 'file'
            }
          },
          portsOut: {}
        }
      ];

      const transformedBox = createBoxFromFormInputs(data, boxTypes);

      expect(transformedBox).to.eql({
        name: 'X',
        type: 'box-type-A',
        portsIn: {
          A: { type: 'file[]' },
          B: { type: 'file' }
        },
        portsOut: {}
      });
    });
  });

  describe('Sending graph to the server', () => {
    it.only('should preprocess the data before sending to the server', () => {
      const boxTypes = [
        {
          name: 'Input Data',
          type: 'data-in',
          portsIn: [],
          portsOut: { 'in-data': { type: '?', value: '' } }
        },
        {
          name: 'GCC Compilation',
          type: 'gcc',
          portsIn: { 'source-files': { type: 'file[]', value: '' } },
          portsOut: { 'binary-file': { type: 'file', value: '' } }
        }
      ];
      const pipeline = {
        boxes: [
          {
            name: 'A',
            portsIn: {},
            portsOut: { 'in-data': { value: 'a', type: '?' } },
            type: 'data-in'
          },
          {
            name: 'B',
            portsIn: { 'source-files': { value: 'a', type: 'file[]' } },
            portsOut: {},
            type: 'gcc'
          }
        ],
        variables: { 'YQ==': ['ABC'] }
      };

      const transformedData = transformPipelineDataForApi(boxTypes, pipeline);

      expect(transformedData).to.eql({
        boxes: [
          {
            name: 'A',
            portsOut: { 'in-data': { value: 'a', type: 'file[]' } },
            type: 'data-in'
          },
          {
            name: 'B',
            portsIn: { 'source-files': { value: 'a', type: 'file[]' } },
            portsOut: { 'binary-file': null },
            type: 'gcc'
          }
        ],
        variables: [
          {
            name: 'a',
            type: 'file[]',
            value: ['ABC']
          }
        ]
      });
    });
  });
});
