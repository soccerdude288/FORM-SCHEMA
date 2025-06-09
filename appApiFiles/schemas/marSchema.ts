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
  Validation
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
        id: "vitals.bps",
        name: "Blood Pressure Systolic",
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
        id: "vitals.bpd",
        name: "Blood Pressure Diastolic",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 200
        },
        visible: false
      },
      {
        id: "vitals.heartRate",
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
        id: "vitals.temp",
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
        id: "vitals.glucose",
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
        id: "vitals.respRate",
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
        id: "vitals.weight",
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
        id: "vitals.oxygen",
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
      }
    ],
    rules: [
      {
        id: "vitalVisibility",
        type: RuleType.DYNAMIC_RULE,
        description: "Use the MAR configuration to define what vitals to allow edits on",
        condition: {
          field: "whatVitals",
          operator: ConditionOperator.CONTAINS
        },
        action: {
          type: ActionType.SHOW,
          property: "vitals",
          propertyValues: [
            {
              value: "BP",
              properties: [
                "bpd",
                "bps"
              ]
            },
            {
              value: "HR",
              properties: [
                "heartRate"
              ]
            },
            {
              value: "02STATS",
              properties: [
                "oxygen",
                "respRate"
              ]
            },
            {
              value: "TEMP",
              properties: [
                "temp"
              ]
            },
            {
              value: "GLUCO",
              properties: [
                "glucose"
              ]
            },
            {
              value: "WEIGHT",
              properties: [
                "weight"
              ]
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
          property: "exceptions.vitalsRequired",
          targetFields: ["bps", "bpd", "heartRate", "respRate", "temp", "glucose", "weight", "oxygen"]
        }
      },
      
      // Dynamic Rule for Notes Requirement
      {
        id: "exceptionRequiresNotes",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with noteRequired=true is selected, require notes",
        condition: {
          field: "exceptions",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes",
          property: "noteRequired",
        }
      },
      
      // Dynamic Rule for Medication Destruction
      {
        id: "exceptionRequiresMedDestruction",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with medDestruction=true is selected, require medication destruction fields",
        condition: {
          field: "exceptions",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "signature",
          property: "medDestruction",
        }
      },
      
      // Dynamic Visibility Rule for Prepare Signature field
      {
        id: "exceptionShowsPrepSig",
        type: RuleType.DYNAMIC_RULE,
        description: "When an exception with medDestruction=true is selected, show prepare signature field",
        condition: {
          field: "exceptions",
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
      
      // Legacy Rule 1: Exception requires notes - keeping for compatibility
      {
        id: "exceptionRequiresNote",
        type: RuleType.REQUIREMENT,
        description: "When an exception is entered, require a note",
        condition: {
          field: "exceptions",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes"
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
      
      // Rule 5: PRN medication requires effectiveness signature
      {
        id: "prnRequiresEffectiveness",
        type: RuleType.REQUIREMENT,
        description: "When PRN medication is administered, require effectiveness signature",
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
    ]
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