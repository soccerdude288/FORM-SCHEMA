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

/**
 * Create the ADL form schema
 * @returns Complete ADL form schema definition
 */
export function getAdlSchema(): FormSchema {
  return {
    name: "ADL",
    multiEntry: true,
    version: "1.0.0",
    fields: [
      // Basic ADL information
      {
        id: "servDate",
        name: "Service Date",
        type: FieldType.DATE,
        editable: false,
        required: true
      },
      {
        id: "servItem",
        name: "Service Item",
        type: FieldType.TEXT,
        editable: false,
        required: true
      },
      {
        id: "inst",
        name: "Instructions",
        type: FieldType.MEMO,
        editable: false,
        required: false
      },
      {
        id: "adlNote",
        name: "Notes",
        type: FieldType.TEXT,
        editable: true,
        required: false
      },
      {
        id: "LOA",
        name: "Level of Assistance",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: true,
        options: [
          { name: "Independent", value: "independent" },
          { name: "Standby Assistance", value: "standby" },
          { name: "Minimal Assistance", value: "minimal" },
          { name: "Moderate Assistance", value: "moderate" },
          { name: "Maximum Assistance", value: "maximum" },
          { name: "Total Assistance", value: "total" }
        ]
      },
      {
        id: "exception",
        name: "Exception",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        inlineData: true // Use exceptions from the parent ADL data object
      },
      {
        id: "schedTime",
        name: "Scheduled Time",
        type: FieldType.SINGLE_SELECT,
        editable: false,
        required: true,
        options: [
          { name: "Morning", value: "morning" },
          { name: "Afternoon", value: "afternoon" },
          { name: "Evening", value: "evening" },
          { name: "Night", value: "night" },
          { name: "PRN", value: "prn" }
        ]
      },
      {
        id: "staffSig",
        name: "Staff Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false
      },
      
      // ADL specific information
      {
        id: "toileting",
        name: "Toileting",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Continent", value: "continent" },
          { name: "Occasional Accident", value: "occasional" },
          { name: "Incontinent", value: "incontinent" },
          { name: "Not Applicable", value: "na" }
        ]
      },
      {
        id: "sleep",
        name: "Sleep",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Well", value: "well" },
          { name: "Adequate", value: "adequate" },
          { name: "Restless", value: "restless" },
          { name: "Poor", value: "poor" },
          { name: "Not Applicable", value: "na" }
        ]
      }
    ],
    rules: [
      // Rule 1: Completed ADL requires notes
      {
        id: "completedAdlRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When an ADL is completed, consider requiring notes",
        condition: {
          field: "staffSig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "adlNote"
        }
      },
      
      // Rule 2: Exception requires notes
      {
        id: "exceptionRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When an exception is selected, require notes",
        condition: {
          field: "exception",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "adlNote"
        }
      },
      
      // Rule 3: Dynamic Rule for Exception Properties
      {
        id: "dynamicExceptionRules",
        type: RuleType.DYNAMIC_RULE,
        description: "Apply dynamic rules based on exception properties",
        condition: {
          field: "exception",
          operator: ConditionOperator.ANY_VALUE
        },
        action: {
          type: ActionType.REQUIRE,
          target: "adlNote",
          property: "noteRequired",
          requirementType: RequirementType.NOTES
        }
      },
      
      // Rule 4: Completed ADL requires Level of Assistance
      {
        id: "completedAdlRequiresLOA",
        type: RuleType.REQUIREMENT,
        description: "When an ADL is completed, require level of assistance",
        condition: {
          field: "staffSig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "LOA"
        }
      },
      
      // Rule 5: Show toileting field for specific ADL types
      {
        id: "showToiletingForSpecificADLs",
        type: RuleType.VISIBILITY,
        description: "Show toileting field for toileting-related ADLs",
        condition: {
          field: "servItem",
          operator: ConditionOperator.CONTAINS,
          value: "toilet"
        },
        action: {
          type: ActionType.SHOW,
          target: "toileting",
          visibilityType: VisibilityType.STANDARD
        }
      },
      
      // Rule 6: Hide toileting field for non-toileting ADLs
      {
        id: "hideToiletingForOtherADLs",
        type: RuleType.VISIBILITY,
        description: "Hide toileting field for non-toileting ADLs",
        condition: {
          field: "servItem",
          operator: ConditionOperator.NOT_EQUALS,
          value: "toilet"
        },
        action: {
          type: ActionType.HIDE,
          target: "toileting",
          visibilityType: VisibilityType.STANDARD
        }
      },
      
      // Rule 7: Show sleep field for sleep-related ADLs
      {
        id: "showSleepForSleepADLs",
        type: RuleType.VISIBILITY,
        description: "Show sleep field for sleep-related ADLs",
        condition: {
          field: "servItem",
          operator: ConditionOperator.CONTAINS,
          value: "sleep"
        },
        action: {
          type: ActionType.SHOW,
          target: "sleep",
          visibilityType: VisibilityType.STANDARD
        }
      },
      
      // Rule 8: Hide sleep field for non-sleep ADLs
      {
        id: "hideSleepForOtherADLs",
        type: RuleType.VISIBILITY,
        description: "Hide sleep field for non-sleep ADLs",
        condition: {
          field: "servItem",
          operator: ConditionOperator.NOT_EQUALS,
          value: "sleep"
        },
        action: {
          type: ActionType.HIDE,
          target: "sleep",
          visibilityType: VisibilityType.STANDARD
        }
      }
    ]
  };
}

// Create a validator function similar to MAR schema
export function validateAdlSchema(schema: FormSchema): boolean {
  try {
    // Import the validator from marSchema
    const { SchemaValidator } = require('./marSchema');
    const validator = new SchemaValidator();
    
    // Validate the schema
    validator.validateSchema(schema);
    console.log("ADL schema validated successfully");
    return true;
  } catch (error) {
    console.error("ADL schema validation failed:", error.message);
    return false;
  }
}

// Validate schema on load
try {
  const adlSchema = getAdlSchema();
  validateAdlSchema(adlSchema);
} catch (error) {
  console.error("Error creating or validating ADL schema:", error.message);
}