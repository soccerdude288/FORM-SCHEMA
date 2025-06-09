/// <reference path="../../../scriptlibrary" />

import {
  FormSchema,
  Field,
  Rule,
  Condition,
  Action,
  FieldType,
  ConditionOperator,
  RuleType,
  ActionType,
  RequirementType,
  VisibilityType,
  FieldOption,
  Validation,
  CalculationType,
  MarDynamicValues
} from './formSchemaInterfaces';

import { schemaValidator } from './schemaUtil'

/**
 * Create the MAR form schema
 * @returns Complete MAR form schema definition
 */
export function getMarSchema(): FormSchema {
  return {
    name: "MAR",
    multiEntry: true,
    version: "1.0.0",
    fields: [
      // Basic medication information
      {
        id: "label",
        name: "Medication",
        type: FieldType.TEXT,
        editable: false,
        required: false,
        visible: true
      },
      
      // Administration fields
      {
        id: "adminTime",
        name: "Date/Time Administered",
        type: FieldType.DATETIME,
        editable: true,
        required: false,
        visible: true
      },
      {
        id: "signature",
        name: "Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false,
        visible: true
      },
      {
        id: "selectedException",
        name: "Exception",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        inlineData: true,
        visible: true
      },
      {
        id: "notes",
        name: "Notes",
        type: FieldType.TEXT,
        editable: true,
        required: false,
        visible: true
      },
      {
        id: "instructions",
        name: "Instructions",
        type: FieldType.MEMO,
        editable: false,
        required: false,
        visible: true
      },
      {
        id: "quantity",
        name: "Quantity Admin",
        type: FieldType.NUMBER,
        editable: true,
        required: true,
        defaultValue: "1.0",
        visible: true
      },
      
      // Vitals fields
      {
        id: "bps",
        name: "Blood Pressure Systolic",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 300
        },
        visible: false,
        dynamicField: true,
        dynamicMapping: {
          source: "whatVitals"
        }
      },
      {
        id: "bpd",
        name: "Blood Pressure Diastolic",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 200
        },
        visible: false,
        dynamicField: true,
        dynamicMapping: {
          source: "whatVitals"
        }
      },
      {
        id: "heartRate",
        name: "Heart Rate",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 300
        },
        visible: false
      },
      {
        id: "temp",
        name: "Temperature",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 120
        },
        visible: false
      },
      {
        id: "glucose",
        name: "Glucose/Blood sugar",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 1000
        },
        visible: false
      },
      {
        id: "respRate",
        name: "Respiratory Rate",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 100
        },
        visible: false
      },
      {
        id: "weight",
        name: "Weight",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 1000
        },
        visible: false
      },
      {
        id: "oxygen",
        name: "O2 Sats",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 100
        },
        visible: false
      },
      
      // Pain assessment fields
      {
        id: "prePain",
        name: "Pre Pain Level",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 10
        },
        visible: false
      },
      {
        id: "postPain",
        name: "Post Pain Level",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 10
        },
        visible: false
      },
      {
        id: "effective",
        name: "Effectiveness",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false,
        visible: false
      },
      {
        id: "prepSig",
        name: "Prepare Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false,
        visible: false
      },
      
      // Calculated field for sliding scale
      {
        id: "slidingScaleDose",
        name: "Sliding Scale Dose",
        type: FieldType.CALCULATED,
        editable: false,
        required: false,
        visible: false,
        dynamicField: true,
        dynamicMapping: {
          source: "slidingScale",
          transform: (scale) => ({
            ranges: scale.start,
            values: scale.doses
          })
        },
        calculation: {
          type: CalculationType.RANGE_LOOKUP,
          rangeLookup: {
            inputField: "glucose",
            ranges: [],  // Will be populated from dynamicValues.slidingScale
            values: [],  // Will be populated from dynamicValues.slidingScale
            defaultValue: "No dose recommended"
          }
        }
      }
    ],
    rules: [
      {
        id: "vitalVisibility",
        type: RuleType.DYNAMIC_RULE,
        description: "Use the MAR configuration to define what vitals to allow edits on",
        condition: {
          field: "dynamicValues.whatVitals",
          operator: ConditionOperator.CONTAINS
        },
        action: {
          type: ActionType.SHOW,
          property: "whatVitals",
          propertyMappings: [
            {
              value: "BP",
              targetFields: ["bps", "bpd"]
            },
            {
              value: "HR",
              targetFields: ["heartRate"]
            },
            {
              value: "O2SATS",
              targetFields: ["oxygen"]
            },
            {
              value: "RESP",
              targetFields: ["respRate"]
            },
            {
              value: "TEMP",
              targetFields: ["temp"]
            },
            {
              value: "GLUCO",
              targetFields: ["glucose"]
            },
            {
              value: "WEIGHT",
              targetFields: ["weight"]
            }
          ]
        }
      },
      // Dynamic Rules for Exceptions with Vitals Requirements
      {
        id: "exceptionRequiresVitals",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with vitalsRequired=true is selected, require vitals that are visible",
        condition: {
          field: "selectedException", 
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          property: "vitalsRequired",
          targetFields: ["bps", "bpd", "heartRate", "respRate", "temp", "glucose", "weight", "oxygen"]
        }
      },
      
      // Dynamic Rule for Notes Requirement
      {
        id: "exceptionRequiresNotes",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with noteRequired=true is selected, require notes",
        condition: {
          field: "selectedException",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes",
          property: "noteRequired"
        }
      },
      
      // Dynamic Rule for Medication Destruction
      {
        id: "exceptionRequiresMedDestruction",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with medDestruction=true is selected, require medication destruction fields",
        condition: {
          field: "selectedException",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "signature",
          property: "medDestruction"
        }
      },
      
      // Dynamic Visibility Rule for Prepare Signature field
      {
        id: "exceptionShowsPrepSig",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with medDestruction=true is selected, show prepare signature field",
        condition: {
          field: "selectedException",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.SHOW,
          target: "prepSig",
          property: "medDestruction",
          visibilityType: VisibilityType.CONDITIONAL,
          dynamicVisibility: true
        }
      },
      
      // Default hide rule for prepare signature field
      {
        id: "hidePrepSigInitially",
        type: RuleType.VISIBILITY,
        description: "Hide prepare signature by default",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "prepSig",
          visibilityType: VisibilityType.STANDARD
        }
      },
      
      // Dynamic Rule for Sliding Scale Visibility
      {
        id: "slidingScaleVisibility",
        type: RuleType.DYNAMIC_RULE,
        description: "Show sliding scale dose calculation when sliding scale data is present",
        condition: {
          field: "dynamicValues.slidingScale",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "slidingScaleDose"
        }
      },
      
      // Rule for non-editable fields when signature is present
      {
        id: "signedFieldsNonEditable",
        type: RuleType.VALIDATION,
        description: "Make fields non-editable when signature is present",
        condition: {
          field: "signature",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.MAKE_NON_EDITABLE,
          targetFields: ["adminTime", "quantity", "notes", "selectedException", "vitals.bps", "vitals.bpd", "vitals.heartRate", "vitals.temp", "vitals.glucose", "vitals.respRate", "vitals.weight", "vitals.oxygen", "prePain", "postPain"]
        }
      },
      
      // Rule 2: Pain medication requires pain level
      {
        id: "painMedRequiresPainLevel",
        type: RuleType.REQUIREMENT,
        description: "When medication is a pain medication, require pain level",
        condition: {
          field: "drugCategories",
          operator: ConditionOperator.CONTAINS,
          value: "pain"
        },
        action: {
          type: ActionType.REQUIRE,
          target: "prePain"
        }
      },
      
      // Rule 3: Pain medication post-pain level
      {
        id: "painMedRequiresPostPainLevel",
        type: RuleType.REQUIREMENT,
        description: "When pain medication is administered, require post-pain level",
        condition: {
          field: "drugCategories",
          operator: ConditionOperator.CONTAINS,
          value: "pain",
          combineOperator: "AND",
          nextCondition: {
            field: "adminTime",
            operator: ConditionOperator.IS_NOT_EMPTY
          }
        },
        action: {
          type: ActionType.REQUIRE,
          target: "postPain"
        }
      },
      
      // Rule 4: Administered medication requires signature
      {
        id: "administeredRequiresSignature",
        type: RuleType.REQUIREMENT,
        description: "When medication is administered, require signature",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "signature"
        }
      },
      
      // Rule 5: PRN medication shows effectiveness signature
      {
        id: "prnShowsEffectiveness",
        type: RuleType.VISIBILITY,
        description: "When PRN pain medication is administered, show effectiveness signature",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY,
          combineOperator: "AND",
          nextCondition: {
            field: "drugCategories",
            operator: ConditionOperator.CONTAINS,
            value: "pain"
          }
        },
        action: {
          type: ActionType.SHOW,
          target: "effective"
        }
      },
      
      // Rule for PRN effectiveness requirement
      {
        id: "prnRequiresEffectivenessRequired",
        type: RuleType.REQUIREMENT,
        description: "When PRN medication is administered and effective is visible, require effectiveness signature",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY,
          combineOperator: "AND",
          nextCondition: {
            field: "drugCategories",
            operator: ConditionOperator.CONTAINS,
            value: "pain"
          }
        },
        action: {
          type: ActionType.REQUIRE,
          target: "effective"
        }
      }
    ],
    dynamicValues: {} as MarDynamicValues // Initialize with empty object, will be populated at runtime
  };
}

// Validate the MAR schema on load
try {
  const marSchema = getMarSchema();
  schemaValidator.validateSchema(marSchema);
  console.log("MAR schema validated successfully");
} catch (error) {
  console.error("MAR schema validation failed:", error.message);
}