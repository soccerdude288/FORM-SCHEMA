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
  VISIBILITY = "VISIBILITY",      // Show/hide fields
  REQUIREMENT = "REQUIREMENT",    // Make fields required/optional
  VALIDATION = "VALIDATION",      // Validate field values
  CALCULATION = "CALCULATION",    // Calculate values
  OPTION_FILTER = "OPTION_FILTER", // Filter options in a select field
  DYNAMIC_RULE = "DYNAMIC_RULE"    // Rule determined by dynamic options
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
 * Requirement type for dynamic rules
 */
export enum RequirementType {
  STANDARD = "STANDARD",       // Regular requirement
  VITALS = "VITALS",           // Require vitals fields
  NOTES = "NOTES",             // Require notes
  MED_DESTRUCTION = "MED_DESTRUCTION" // Require medication destruction
}

/**
 * Visibility type for dynamic rules
 */
export enum VisibilityType {
  STANDARD = "STANDARD",       // Regular visibility
  CONDITIONAL = "CONDITIONAL"  // Visibility controlled by a condition
}

/**
 * Additional properties for dynamic options fields
 */
export interface ExceptionOptionProperties {
  vitalsRequired?: boolean;      // Whether vitals are required for this exception
  noteRequired?: boolean;        // Whether notes are required for this exception
  medDestruction?: boolean;      // Whether medication destruction is required
}

/**
 * Action to take when rule conditions are met
 */
export interface Action {
  type: ActionType;              // What kind of action
  target: string;                // Field ID this action affects
  value?: any;                   // Optional value for calculations/validations
  requirementType?: RequirementType; // For REQUIRE actions, the type of requirement
  visibilityType?: VisibilityType;  // For SHOW/HIDE actions, the type of visibility
  targetFields?: string[];       // For group actions, the list of affected fields
  sourceOption?: string;         // For option-based rules, the option value that triggers this
  property?: string;             // For dynamic rules, the property on the option that controls this
  dynamicVisibility?: boolean;   // For dynamic visibility rules
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
  
  // Options configuration
  options?: FieldOption[];       // For select fields, list of static options
  
  // Dynamic options configuration
  inlineData?: boolean;          // Whether to use inline data from parent request
  optionProperties?: ExceptionOptionProperties[]; // Additional properties for dynamic options
  
  // Validation
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