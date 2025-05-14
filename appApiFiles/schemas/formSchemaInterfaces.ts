/// <reference path="../../../scriptlibrary" />

/**
 * Form Schema Interfaces
 * 
 * This file contains the core interfaces and enums for the simplified form schema system.
 * These types are used to define the structure of forms, their fields, and business rules.
 */

// -------------------------
// Core Enums
// -------------------------

/**
 * Field types supported by the schema system
 */
export enum FieldType {
  TEXT = "TEXT",
  MEMO = "MEMO",
  NUMBER = "NUMBER",
  DATE = "DATE",
  DATETIME = "DATETIME",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  SIGNATURE = "SIGNATURE"
}

/**
 * Operators for conditions
 */
export enum ConditionOperator {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  CONTAINS = "CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  IS_EMPTY = "IS_EMPTY",
  IS_NOT_EMPTY = "IS_NOT_EMPTY",
  ANY_VALUE = "ANY_VALUE"  // Special case for "any value selected"
}

/**
 * Types of rules
 */
export enum RuleType {
  VISIBILITY = "VISIBILITY",    // Show/hide fields
  REQUIREMENT = "REQUIREMENT",  // Make fields required/optional
  VALIDATION = "VALIDATION",    // Validate field values
  CALCULATION = "CALCULATION",  // Calculate values
  OPTION_FILTER = "OPTION_FILTER" // Filter options in a select field
}

/**
 * Action types for rules
 */
export enum ActionType {
  SHOW = "SHOW",
  HIDE = "HIDE",
  REQUIRE = "REQUIRE",
  OPTIONAL = "OPTIONAL",
  CALCULATE = "CALCULATE",
  VALIDATE = "VALIDATE",
  FILTER_OPTIONS = "FILTER_OPTIONS"
}

// -------------------------
// Core Interfaces
// -------------------------

/**
 * Option for select fields
 */
export interface FieldOption {
  name: string;        // Display name
  value: string;       // Stored/export value
}

/**
 * Validation rules for fields
 */
export interface Validation {
  required?: boolean;              // Whether field is required
  min?: number;                    // Min value (for numbers) or length (for text)
  max?: number;                    // Max value (for numbers) or length (for text)
  pattern?: string;                // Regex pattern (for text)
  message?: string;                // Custom error message
}

/**
 * Condition for a rule
 */
export interface Condition {
  field: string;                         // Field ID this condition checks
  operator: ConditionOperator;           // How to compare
  value?: any;                            // Value to compare against (optional for operators like IS_EMPTY)
  combineOperator?: 'AND' | 'OR';        // How to combine with next condition
  nextCondition?: Condition;             // Optional next condition in chain
}

/**
 * Action to take when rule conditions are met
 */
export interface Action {
  type: ActionType;        // What kind of action
  target: string;          // Field ID this action affects
  value?: any;             // Optional value for calculations/validations
}

/**
 * Field definition
 */
export interface Field {
  id: string;                    // Unique field identifier
  name: string;                  // Display name
  type: FieldType;               // Field type
  editable: boolean;             // Whether field can be edited
  required: boolean;             // Whether field is required by default
  options?: FieldOption[];       // For select fields, list of options
  dynamicOptions?: string;       // For dynamic options, reference to source
  dynamicOptionsEndpoint?: string; // Endpoint where app can fetch options
  dynamicOptionsParam?: string;  // Parameter for the dynamic options endpoint
  validation?: Validation;       // Validation rules
}

/**
 * Rule definition
 */
export interface Rule {
  id: string;                    // Unique rule identifier
  type: RuleType;                // Rule type
  description?: string;          // Human-readable description
  condition: Condition;          // When rule applies
  action: Action;                // What happens when rule applies
}

/**
 * Complete form schema
 */
export interface FormSchema {
  name: string;                  // Form name
  multiEntry: boolean;           // Whether this is a multi-entry form
  fields: Field[];               // List of fields in form
  rules: Rule[];                 // List of business rules
  version?: string;              // Optional schema version
}