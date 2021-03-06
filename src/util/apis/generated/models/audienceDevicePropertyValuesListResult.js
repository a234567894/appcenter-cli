/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

/**
 * List of device property values.
 *
 */
class AudienceDevicePropertyValuesListResult {
  /**
   * Create a AudienceDevicePropertyValuesListResult.
   * @member {array} values List of device property values.
   */
  constructor() {
  }

  /**
   * Defines the metadata of AudienceDevicePropertyValuesListResult
   *
   * @returns {object} metadata of AudienceDevicePropertyValuesListResult
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'AudienceDevicePropertyValuesListResult',
      type: {
        name: 'Composite',
        className: 'AudienceDevicePropertyValuesListResult',
        modelProperties: {
          values: {
            required: true,
            serializedName: 'values',
            type: {
              name: 'Sequence',
              element: {
                  required: false,
                  serializedName: 'StringElementType',
                  type: {
                    name: 'String'
                  }
              }
            }
          }
        }
      }
    };
  }
}

module.exports = AudienceDevicePropertyValuesListResult;
