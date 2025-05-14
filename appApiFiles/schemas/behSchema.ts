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
 * Create the Behavior Plan form schema
 * @returns Complete Behavior Plan schema definition
 */
export function getBehSchema(): FormSchema {
  return {
    name: "Behavior",
    multiEntry: true,
    version: "1.0.0",
    fields: [
      // Basic behavior information
      {
        id: "date",
        name: "Date",
        type: FieldType.DATE,
        editable: false,
        required: true
      },
      {
        id: "targetBehavior",
        name: "Target Behavior",
        type: FieldType.TEXT,
        editable: false,
        required: true
      },
      {
        id: "description",
        name: "Description",
        type: FieldType.MEMO,
        editable: false,
        required: false
      },
      {
        id: "antecedent",
        name: "Antecedent",
        type: FieldType.MEMO,
        editable: true,
        required: false
      },
      {
        id: "intervention",
        name: "Intervention",
        type: FieldType.MEMO,
        editable: true,
        required: false
      },
      {
        id: "frequency",
        name: "Frequency",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Once", value: "once" },
          { name: "2-3 Times", value: "2-3" },
          { name: "4-5 Times", value: "4-5" },
          { name: "More than 5 Times", value: "5+" }
        ]
      },
      {
        id: "duration",
        name: "Duration",
        type: FieldType.NUMBER,
        editable: true,
        required: false,
        validation: {
          min: 0,
          max: 1440 // minutes in a day
        }
      },
      {
        id: "intensity",
        name: "Intensity",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Low", value: "low" },
          { name: "Medium", value: "medium" },
          { name: "High", value: "high" }
        ]
      },
      {
        id: "notes",
        name: "Notes",
        type: FieldType.MEMO,
        editable: true,
        required: false
      },
      {
        id: "staffSig",
        name: "Staff Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false
      }
    ],
    rules: [
      // Rule 1: Behavior occurrence requires antecedent
      {
        id: "behaviorRequiresAntecedent",
        type: RuleType.REQUIREMENT,
        description: "When a behavior is recorded, require an antecedent",
        condition: {
          field: "staffSig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "antecedent"
        }
      },
      
      // Rule 2: Behavior occurrence requires intervention
      {
        id: "behaviorRequiresIntervention",
        type: RuleType.REQUIREMENT,
        description: "When a behavior is recorded, require an intervention",
        condition: {
          field: "staffSig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "intervention"
        }
      },
      
      // Rule 3: Behavior occurrence requires frequency
      {
        id: "behaviorRequiresFrequency",
        type: RuleType.REQUIREMENT,
        description: "When a behavior is recorded, require a frequency",
        condition: {
          field: "staffSig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "frequency"
        }
      },
      
      // Rule 4: High intensity behaviors require notes
      {
        id: "highIntensityRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When a high intensity behavior is recorded, require notes",
        condition: {
          field: "intensity",
          operator: ConditionOperator.EQUALS,
          value: "high"
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes"
        }
      },
      
      // Rule 5: Show duration field for certain behaviors
      {
        id: "showDurationForCertainBehaviors",
        type: RuleType.VISIBILITY,
        description: "Show duration field for behaviors that have duration",
        condition: {
          field: "targetBehavior",
          operator: ConditionOperator.CONTAINS,
          value: "duration"
        },
        action: {
          type: ActionType.SHOW,
          target: "duration",
          visibilityType: VisibilityType.STANDARD
        }
      },
      
      // Rule 6: Hide duration field for other behaviors
      {
        id: "hideDurationForOtherBehaviors",
        type: RuleType.VISIBILITY,
        description: "Hide duration field for behaviors without duration",
        condition: {
          field: "targetBehavior",
          operator: ConditionOperator.NOT_CONTAINS,
          value: "duration"
        },
        action: {
          type: ActionType.HIDE,
          target: "duration",
          visibilityType: VisibilityType.STANDARD
        }
      }
    ]
  };
}

// Create a validator function similar to MAR schema
export function validateBehSchema(schema: FormSchema): boolean {
  try {
    // Import the validator from marSchema
    const { SchemaValidator } = require('./marSchema');
    const validator = new SchemaValidator();
    
    // Validate the schema
    validator.validateSchema(schema);
    console.log("Behavior schema validated successfully");
    return true;
  } catch (error) {
    console.error("Behavior schema validation failed:", error.message);
    return false;
  }
}

// Validate schema on load
try {
  const behSchema = getBehSchema();
  validateBehSchema(behSchema);
} catch (error) {
  console.error("Error creating or validating Behavior schema:", error.message);
}