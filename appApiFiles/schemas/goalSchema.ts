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
 * Create the Goals/Support Strategies form schema
 * @returns Complete Goals schema definition
 */
export function getGoalSchema(): FormSchema {
  return {
    name: "Goal",
    multiEntry: true,
    version: "1.0.0",
    fields: [
      // Basic goal information
      {
        id: "date",
        name: "Date",
        type: FieldType.DATE,
        editable: false,
        required: true
      },
      {
        id: "goalRel",
        name: "Goal",
        type: FieldType.TEXT,
        editable: false,
        required: true
      },
      {
        id: "supportStrat",
        name: "Support Strategy",
        type: FieldType.MULTI_SELECT,
        editable: false,
        required: false,
        inlineData: true
      },
      {
        id: "instructions",
        name: "Instructions",
        type: FieldType.MEMO,
        editable: false,
        required: false
      },
      {
        id: "notes",
        name: "Notes",
        type: FieldType.TEXT,
        editable: true,
        required: false
      },
      {
        id: "exception",
        name: "Exception",
        type: FieldType.MULTI_SELECT,
        editable: true,
        required: false,
        inlineData: true
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
        id: "clientCompletion",
        name: "Client Completion",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Independent", value: "independent" },
          { name: "With Verbal Prompts", value: "verbal" },
          { name: "With Physical Assistance", value: "physical" },
          { name: "Refused", value: "refused" },
          { name: "Not Attempted", value: "not_attempted" }
        ]
      },
      {
        id: "sig",
        name: "Staff Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false
      }
    ],
    rules: [
      // Rule 1: Completed goal requires notes
      {
        id: "completedGoalRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When a goal is completed, consider requiring notes",
        condition: {
          field: "sig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes"
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
          target: "notes"
        }
      },
      
      // Rule 3: Client refused requires notes
      {
        id: "clientRefusedRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When client refused, require notes",
        condition: {
          field: "clientCompletion",
          operator: ConditionOperator.EQUALS,
          value: "refused"
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes"
        }
      },
      
      // Rule 4: Completed goal requires client completion
      {
        id: "completedGoalRequiresClientCompletion",
        type: RuleType.REQUIREMENT,
        description: "When a goal is completed, require client completion",
        condition: {
          field: "sig",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.REQUIRE,
          target: "clientCompletion"
        }
      },
      
      // Rule 5: Dynamic Rule for Exception Properties
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
          target: "notes",
          property: "noteRequired",
          requirementType: RequirementType.NOTES
        }
      },
      
      // Rule 6: Not attempted requires notes
      {
        id: "notAttemptedRequiresNotes",
        type: RuleType.REQUIREMENT,
        description: "When goal not attempted, require notes",
        condition: {
          field: "clientCompletion",
          operator: ConditionOperator.EQUALS,
          value: "not_attempted"
        },
        action: {
          type: ActionType.REQUIRE,
          target: "notes"
        }
      }
    ]
  };
}

// Create a validator function similar to MAR schema
export function validateGoalSchema(schema: FormSchema): boolean {
  try {
    // Import the validator from marSchema
    const { SchemaValidator } = require('./marSchema');
    const validator = new SchemaValidator();
    
    // Validate the schema
    validator.validateSchema(schema);
    console.log("Goal schema validated successfully");
    return true;
  } catch (error) {
    console.error("Goal schema validation failed:", error.message);
    return false;
  }
}

// Validate schema on load
try {
  const goalSchema = getGoalSchema();
  validateGoalSchema(goalSchema);
} catch (error) {
  console.error("Error creating or validating Goal schema:", error.message);
}