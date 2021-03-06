/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

const models = require('./index');

/**
 * Class representing a TesterAppResponse.
 * @extends models['BasicAppResponse']
 */
class TesterAppResponse extends models['BasicAppResponse'] {
  /**
   * Create a TesterAppResponse.
   * @member {array} distributionGroups The IDs of the distribution groups the
   * current user is member of.
   */
  constructor() {
    super();
  }

  /**
   * Defines the metadata of TesterAppResponse
   *
   * @returns {object} metadata of TesterAppResponse
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'TesterAppResponse',
      type: {
        name: 'Composite',
        className: 'TesterAppResponse',
        modelProperties: {
          id: {
            required: true,
            serializedName: 'id',
            type: {
              name: 'String'
            }
          },
          description: {
            required: false,
            serializedName: 'description',
            type: {
              name: 'String'
            }
          },
          displayName: {
            required: true,
            serializedName: 'display_name',
            type: {
              name: 'String'
            }
          },
          iconUrl: {
            required: false,
            serializedName: 'icon_url',
            type: {
              name: 'String'
            }
          },
          name: {
            required: true,
            serializedName: 'name',
            type: {
              name: 'String'
            }
          },
          os: {
            required: true,
            serializedName: 'os',
            type: {
              name: 'String'
            }
          },
          owner: {
            required: true,
            serializedName: 'owner',
            type: {
              name: 'Composite',
              className: 'Owner'
            }
          },
          distributionGroups: {
            required: true,
            serializedName: 'distribution_groups',
            type: {
              name: 'Sequence',
              element: {
                  required: false,
                  serializedName: 'DistributionGroupResponseElementType',
                  type: {
                    name: 'Composite',
                    className: 'DistributionGroupResponse'
                  }
              }
            }
          }
        }
      }
    };
  }
}

module.exports = TesterAppResponse;
