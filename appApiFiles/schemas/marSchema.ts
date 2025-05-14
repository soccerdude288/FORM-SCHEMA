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
  FieldOption,
  Validation
} from './formSchemaInterfaces';

/**
 * Schema Validator - Utility class to validate schema definitions
 * 
 * This ensures that schemas are structurally correct before being sent to the app
 */
export class SchemaValidator {
  /**
   * Validates a schema for structural integrity
   * @param schema The schema to validate
   * @throws Error if the schema is invalid
   */
  validateSchema(schema: FormSchema): void {
    // Check for empty schema
    if (!schema.name) {
      throw new Error("Schema must have a name");
    }
    
    if (!schema.fields || schema.fields.length === 0) {
      throw new Error("Schema must have at least one field");
    }
    
    // Check for duplicate field IDs
    const fieldIds = schema.fields.map(f => f.id);
    const uniqueFieldIds = [...new Set(fieldIds)];
    if (fieldIds.length !== uniqueFieldIds.length) {
      throw new Error("Schema contains duplicate field IDs");
    }
    
    // Check for duplicate rule IDs
    if (schema.rules && schema.rules.length > 0) {
      const ruleIds = schema.rules.map(r => r.id);
      const uniqueRuleIds = [...new Set(ruleIds)];
      if (ruleIds.length !== uniqueRuleIds.length) {
        throw new Error("Schema contains duplicate rule IDs");
      }
      
      // Validate each rule
      schema.rules.forEach(rule => this.validateRule(rule, fieldIds));
    }
    
    // Validate each field
    schema.fields.forEach(field => this.validateField(field));
  }
  
  /**
   * Validates a single field
   * @param field The field to validate
   */
  private validateField(field: Field): void {
    // Check for required field properties
    if (!field.id) throw new Error("Field must have an ID");
    if (!field.name) throw new Error("Field must have a name");
    if (!field.type) throw new Error("Field must have a type");
    
    // Check field type-specific requirements
    if ((field.type === FieldType.SINGLE_SELECT || field.type === FieldType.MULTI_SELECT) && 
        !field.options && !field.dynamicOptions && !field.dynamicOptionsEndpoint) {
      throw new Error(`Select field ${field.id} must have either options, dynamicOptions, or dynamicOptionsEndpoint`);
    }
    
    // Validate options if present
    if (field.options) {
      if (field.options.length === 0) {
        throw new Error(`Field ${field.id} has an empty options array`);
      }
      
      // Check for option values
      field.options.forEach(option => {
        if (!option.name) throw new Error(`Option in field ${field.id} is missing a name`);
        if (!option.value) throw new Error(`Option in field ${field.id} is missing a value`);
      });
    }
    
    // Validate validation rules if present
    if (field.validation) {
      // For number fields with min/max
      if (field.type === FieldType.NUMBER) {
        if (field.validation.min !== undefined && field.validation.max !== undefined &&
            field.validation.min > field.validation.max) {
          throw new Error(`Field ${field.id} has min > max`);
        }
      }
      
      // For text fields with pattern
      if ((field.type === FieldType.TEXT || field.type === FieldType.MEMO) && 
          field.validation.pattern) {
        try {
          new RegExp(field.validation.pattern);
        } catch (e) {
          throw new Error(`Field ${field.id} has an invalid regex pattern: ${e.message}`);
        }
      }
    }
  }
  
  /**
   * Validates a single rule
   * @param rule The rule to validate
   * @param fieldIds List of valid field IDs in the schema
   */
  private validateRule(rule: Rule, fieldIds: string[]): void {
    // Check for required rule properties
    if (!rule.id) throw new Error("Rule must have an ID");
    if (!rule.type) throw new Error("Rule must have a type");
    if (!rule.condition) throw new Error("Rule must have a condition");
    if (!rule.action) throw new Error("Rule must have an action");
    
    // Validate condition
    this.validateCondition(rule.condition, fieldIds);
    
    // Validate action
    this.validateAction(rule.action, rule.type, fieldIds);
  }
  
  /**
   * Validates a condition
   * @param condition The condition to validate
   * @param fieldIds List of valid field IDs in the schema
   */
  private validateCondition(condition: Condition, fieldIds: string[]): void {
    // Check that the field exists
    if (!fieldIds.includes(condition.field)) {
      throw new Error(`Condition references non-existent field: ${condition.field}`);
    }
    
    // Validate next condition if present
    if (condition.nextCondition) {
      if (!condition.combineOperator) {
        throw new Error("Condition with nextCondition must have a combineOperator");
      }
      this.validateCondition(condition.nextCondition, fieldIds);
    }
  }
  
  /**
   * Validates an action
   * @param action The action to validate
   * @param ruleType The type of the parent rule
   * @param fieldIds List of valid field IDs in the schema
   */
  private validateAction(action: Action, ruleType: RuleType, fieldIds: string[]): void {
    // Check that the target field exists
    if (!fieldIds.includes(action.target)) {
      throw new Error(`Action targets non-existent field: ${action.target}`);
    }
    
    // Validate action type against rule type
    const validActionTypes: { [key in RuleType]: ActionType[] } = {
      [RuleType.VISIBILITY]: [ActionType.SHOW, ActionType.HIDE],
      [RuleType.REQUIREMENT]: [ActionType.REQUIRE, ActionType.OPTIONAL],
      [RuleType.VALIDATION]: [ActionType.VALIDATE],
      [RuleType.CALCULATION]: [ActionType.CALCULATE],
      [RuleType.OPTION_FILTER]: [ActionType.FILTER_OPTIONS]
    };
    
    if (!validActionTypes[ruleType].includes(action.type)) {
      throw new Error(`Action type ${action.type} is not valid for rule type ${ruleType}`);
    }
    
    // Additional validations based on action type
    if (action.type === ActionType.CALCULATE && action.value === undefined) {
      throw new Error("CALCULATE action must have a value");
    }
  }
}

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
        id: "medication",
        name: "Medication",
        type: FieldType.TEXT,
        editable: false,
        required: false
      },
      {
        id: "medicationTextUrl",
        name: "Medication Text/URL",
        type: FieldType.TEXT,
        editable: true,
        required: false
      },
      {
        id: "dosage",
        name: "Dosage",
        type: FieldType.TEXT,
        editable: true,
        required: true
      },
      {
        id: "diagnosis",
        name: "Diagnosis",
        type: FieldType.TEXT,
        editable: true,
        required: false
      },
      {
        id: "routeOfAdmin",
        name: "Route of Administration",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: true,
        options: [
          { name: "Oral", value: "PO" },
          { name: "Subcutaneous", value: "SQ" },
          { name: "Intramuscular", value: "IM" },
          { name: "Transdermal", value: "T" }
        ]
      },
      {
        id: "drugCategories",
        name: "Drug Categories",
        type: FieldType.MULTI_SELECT,
        editable: true,
        required: false,
        options: [
          { name: "Pain", value: "pain" },
          { name: "Controlled", value: "controlled" }
        ]
      },
      
      // Administration fields
      {
        id: "adminTime",
        name: "Date/Time Administered",
        type: FieldType.DATETIME,
        editable: true,
        required: false
      },
      {
        id: "signature",
        name: "Signature",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false
      },
      {
        id: "exceptions",
        name: "Exception",
        type: FieldType.SINGLE_SELECT,
        editable: true,
        required: false,
        dynamicOptionsEndpoint: "/api/v1/exceptions",
        dynamicOptionsParam: "residentId"
      },
      {
        id: "notes",
        name: "Notes",
        type: FieldType.TEXT,
        editable: true,
        required: false
      },
      {
        id: "instructions",
        name: "Instructions",
        type: FieldType.MEMO,
        editable: false,
        required: false
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
      },
      {
        id: "effective",
        name: "Effectiveness",
        type: FieldType.SIGNATURE,
        editable: true,
        required: false
      }
    ],
    rules: [
      // Rule 1: Exception requires notes
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
      },
      
      // Visibility Rules for Vitals
      
      // Rule 6: Hide vitals fields initially
      {
        id: "hideVitalsInitially",
        type: RuleType.VISIBILITY,
        description: "Hide blood pressure fields until needed",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "bps"
        }
      },
      
      // Rule 7: Hide blood pressure diastolic initially
      {
        id: "hideBPDInitially",
        type: RuleType.VISIBILITY,
        description: "Hide blood pressure diastolic field until needed",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "bpd"
        }
      },
      
      // Rule 8: Show blood pressure fields when administration time is entered
      {
        id: "showBPFields",
        type: RuleType.VISIBILITY,
        description: "Show BP fields when admin time is entered",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "bps"
        }
      },
      
      // Rule 9: Show BP diastolic when administration time is entered
      {
        id: "showBPDFields",
        type: RuleType.VISIBILITY,
        description: "Show BP diastolic field when admin time is entered",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "bpd"
        }
      },
      
      // Rules for heart rate visibility
      {
        id: "hideHeartRateInitially",
        type: RuleType.VISIBILITY,
        description: "Hide heart rate field until needed",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "heartRate"
        }
      },
      {
        id: "showHeartRateWhenAdministered",
        type: RuleType.VISIBILITY,
        description: "Show heart rate field when administered",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "heartRate"
        }
      },
      
      // Rules for other vitals (similar pattern)
      {
        id: "hideTempInitially",
        type: RuleType.VISIBILITY,
        description: "Hide temperature field until needed",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "temp"
        }
      },
      {
        id: "showTempWhenAdministered",
        type: RuleType.VISIBILITY,
        description: "Show temperature field when administered",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "temp"
        }
      },
      
      // Rules for glucose visibility
      {
        id: "hideGlucoseInitially",
        type: RuleType.VISIBILITY,
        description: "Hide glucose field until needed",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_EMPTY
        },
        action: {
          type: ActionType.HIDE,
          target: "glucose"
        }
      },
      {
        id: "showGlucoseWhenAdministered",
        type: RuleType.VISIBILITY,
        description: "Show glucose field when administered",
        condition: {
          field: "adminTime",
          operator: ConditionOperator.IS_NOT_EMPTY
        },
        action: {
          type: ActionType.SHOW,
          target: "glucose"
        }
      }
    ]
  };
}

// Create a singleton instance of the schema validator
export const schemaValidator = new SchemaValidator();

// Validate the MAR schema on load
try {
  const marSchema = getMarSchema();
  schemaValidator.validateSchema(marSchema);
  console.log("MAR schema validated successfully");
} catch (error) {
  console.error("MAR schema validation failed:", error.message);
}