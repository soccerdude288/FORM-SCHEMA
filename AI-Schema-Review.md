# MAR Schema System Documentation

## Overview

The Medication Administration Record (MAR) schema provides a structured approach to defining, validating, and enforcing business rules for medication administration. This document outlines the schema structure, rule system, and implementation guidelines for application developers integrating with the MAR system.

## Schema Structure

The schema follows a hierarchical structure that defines the data model, validation rules, and business logic for medication administration:

```typescript
interface FormSchema {
  name: string,              // Name of the form (e.g., "MAR")
  multiEntry: boolean,       // Whether multiple entries are allowed per record
  fields: Array<Field>,      // Field definitions
  rules: Array<EnhancedRule> // Business rules and validation logic
}
```

### Field Types

Fields represent data elements in the MAR form and include various types:

- **TEXT**: Simple text input
- **MEMO**: Multi-line text input
- **NUMBER**: Numeric input with optional min/max constraints
- **SINGLE_SELECT**: Dropdown with single selection
- **MULTI_SELECT**: Dropdown with multiple selections
- **SIGNATURE**: Electronic signature field

Each field has properties defining its behavior:

```typescript
interface Field {
  name: string,              // Display name
  fieldId: string,           // Unique identifier
  editable: boolean,         // Whether users can modify the field
  fieldType: FieldTypeEnum   // Field type (TEXT, NUMBER, etc.)
}

interface EditableField extends Field {
  required: boolean,         // Whether the field is required
  defaultValue?: string,     // Optional default value
}
```

Specialized field types have additional properties:

- **SelectField**: Includes options array
- **NumberField**: Includes min/max constraints
- **TextField**: May include regex validation

## Enhanced Rule System

The rule system provides a comprehensive framework for defining business logic, validation, and workflows. Each rule consists of:

1. **Metadata**: ID and description
2. **Type**: Categorization of the rule purpose
3. **Conditions**: When the rule should be applied
4. **Actions**: What should happen when conditions are met

```typescript
interface EnhancedRule {
  ruleId: string,                  // Unique identifier
  description: string,             // Human-readable description
  type: RuleTypeEnum,              // Rule category
  conditions: Array<RuleConditionGroups>, // When rule applies
  actions: Array<EnhancedRuleAction>,     // What rule does
}
```

### Rule Types

Rules are categorized by their purpose:

- **VISIBILITY**: Control field visibility
- **REQUIREMENT**: Make fields required conditionally
- **VALIDATION**: Validate field values
- **SIGNATURE**: Handle signature collection workflow
- **MEDICATION**: Medication-specific rules
- **CALCULATION**: Calculate values based on other inputs

### Conditions

Conditions determine when a rule should be applied. They can be combined using AND/OR operators:

```typescript
interface RuleConditionGroups {
  operator: ConditionGroupOperatorEnum, // AND/OR
  conditions: Array<RuleCondition>      // Individual conditions
}

interface RuleCondition {
  field: string,                       // Field to evaluate
  operator: ConditionOperatorEnum,     // EQUALS, NOT_EQUALS, etc.
  value: string | GenericRuleValue     // Value to compare against
}
```

Supported condition operators:
- **EQUALS**: Field value equals specified value
- **NOT_EQUALS**: Field value doesn't equal specified value
- **CONTAINS**: Array field contains specified value
- **GREATER_THAN**: Field value is greater than specified value
- **LESS_THAN**: Field value is less than specified value

### Actions

Actions define what happens when conditions are met. Enhanced actions support specialized behaviors:

```typescript
interface EnhancedRuleAction {
  action: RuleActionEnum,             // Type of action
  field: string,                      // Target field
  configuration?: object              // Action-specific configuration
}
```

Supported actions:
- **Basic Actions**: HIDE, SHOW, REQUIRE, UNREQUIRE, EDITABLE, UNEDITABLE
- **Enhanced Actions**: 
  - **VALIDATE**: Apply validation rules
  - **COLLECT_SIGNATURE**: Handle signature workflow
  - **ENFORCE_INTERVAL**: Enforce time between doses
  - **REQUIRE_VITALS**: Require vital signs collection
  - **REQUIRE_PAIN_ASSESSMENT**: Require pain assessment
  - **CALCULATE_DOSE**: Calculate dosage based on inputs

### Specialized Configurations

Different action types have specialized configuration options:

#### Validation Configuration
```typescript
interface ValidationConfig {
  type: 'RANGE' | 'REGEX' | 'CUSTOM',
  min?: number,                // Minimum value for range validation
  max?: number,                // Maximum value for range validation
  pattern?: string,            // Regex pattern for text validation
  message?: string,            // Error message
  customValidator?: string     // Reference to custom validator function
}
```

#### Interval Configuration
```typescript
interface IntervalConfig {
  minInterval: number,         // Minimum hours between doses
  enforceStrict: boolean,      // Whether override is allowed
  overridePermission?: string  // Permission required to override
}
```

#### Pain Assessment Configuration
```typescript
interface PainAssessmentConfig {
  requirePre: boolean,         // Require pre-administration assessment
  requirePost: boolean,        // Require post-administration assessment
  minDelta?: number,           // Required improvement
  interval?: number            // Minutes to collect post assessment
}
```

#### Glucose Configuration
```typescript
interface GlucoseConfig {
  slidingScale: boolean,
  ranges?: Array<{
    min: number,
    max: number,
    dose: string
  }>
}
```

#### Signature Configuration
```typescript
interface SignatureConfig {
  type: 'PREP' | 'ADMIN' | 'EFFECTIVENESS' | 'WASTE',
  requireReason?: boolean,
  requireWitness?: boolean,
  requireSupervisor?: boolean
}
```

## Implementation Examples

### Example 1: Field Requiring Notes for Exceptions

```json
{
  "ruleId": "exceptionRequiresNote",
  "description": "When an exception is entered, require a note",
  "type": "REQUIREMENT",
  "conditions": [
    {
      "operator": "AND",
      "conditions": [
        {
          "field": "exception",
          "operator": "EQUALS",
          "value": "ANY"
        }
      ]
    }
  ],
  "actions": [
    {
      "action": "REQUIRE",
      "field": "notes"
    }
  ]
}
```

### Example 2: Glucose Validation for Insulin

```json
{
  "ruleId": "insulinRequiresGlucose",
  "description": "Insulin administration requires glucose reading",
  "type": "MEDICATION",
  "conditions": [
    {
      "operator": "AND",
      "conditions": [
        {
          "field": "medicationType",
          "operator": "EQUALS",
          "value": "INSULIN"
        }
      ]
    }
  ],
  "actions": [
    {
      "action": "REQUIRE",
      "field": "glucose"
    },
    {
      "action": "CALCULATE_DOSE",
      "field": "dosage",
      "configuration": {
        "slidingScale": true,
        "ranges": [
          { "min": 0, "max": 70, "dose": "Call physician" },
          { "min": 71, "max": 150, "dose": "0 units" },
          { "min": 151, "max": 200, "dose": "2 units" },
          { "min": 201, "max": 250, "dose": "4 units" },
          { "min": 251, "max": 300, "dose": "6 units" },
          { "min": 301, "max": 350, "dose": "8 units" },
          { "min": 351, "max": 400, "dose": "10 units" },
          { "min": 401, "max": 9999, "dose": "Call physician" }
        ]
      }
    }
  ]
}
```

## Integration Guidelines

When integrating with the MAR schema system:

1. **Schema Loading**:
   - Load the schema definition from the API or configuration file
   - Parse the fields and rules
   - Initialize the UI based on field definitions

2. **Rule Processing**:
   - Implement a rule processor that can evaluate conditions and apply actions
   - Process rules whenever relevant field values change
   - Apply actions in the order they are defined

3. **Validation Flow**:
   - Apply validation rules before submission
   - Show appropriate error messages from validation configurations
   - Prevent submission if validations fail

4. **Specialized Rule Handling**:
   - Implement handlers for each action type (VALIDATE, COLLECT_SIGNATURE, etc.)
   - Configure UI components based on rule requirements
   - Implement business logic for specialized actions like ENFORCE_INTERVAL

5. **Error Handling**:
   - Validate the schema structure before processing
   - Handle missing fields or invalid references
   - Log rule processing failures for debugging

## Best Practices

1. **Performance Optimization**:
   - Cache rule evaluation results when possible
   - Only re-evaluate rules when dependent fields change
   - Use efficient condition checking algorithms

2. **User Experience**:
   - Show clear validation messages
   - Apply visual indicators for required fields
   - Provide override mechanisms for authorized users

3. **Extensibility**:
   - Design your rule processor to handle new rule types
   - Create a plugin architecture for custom validators
   - Implement a configuration UI for rule management

4. **Security**:
   - Validate all override permissions
   - Implement signature verification
   - Maintain audit logs for rule overrides

## Healthcare-Specific Considerations

1. **Clinical Safety**:
   - Ensure medication rules prioritize patient safety
   - Implement clear warnings for dose calculations
   - Provide override documentation for clinical exceptions

2. **Compliance**:
   - Support documentation of exceptions for regulatory compliance
   - Maintain detailed audit trails for all medication activities
   - Implement proper signature verification and authentication

3. **Workflow Integration**:
   - Consider how MAR interfaces with eMAR and pharmacy systems
   - Support barcode scanning for medication verification
   - Implement appropriate notification systems for missed doses

## Technical Reference

### Rule Type Enum
```typescript
enum RuleTypeEnum {
  VISIBILITY = "VISIBILITY",
  REQUIREMENT = "REQUIREMENT",
  VALIDATION = "VALIDATION",
  SIGNATURE = "SIGNATURE",
  MEDICATION = "MEDICATION",
  CALCULATION = "CALCULATION"
}
```

### Rule Action Enum
```typescript
enum RuleActionEnum {
  HIDE = "HIDE",
  SHOW = "SHOW",
  REQUIRE = "REQUIRE",
  UNREQUIRE = "UNREQUIRE",
  EDITABLE = "EDITABLE",
  UNEDITABLE = "UNEDITABLE",
  VALIDATE = "VALIDATE",
  COLLECT_SIGNATURE = "COLLECT_SIGNATURE",
  ENFORCE_INTERVAL = "ENFORCE_INTERVAL",
  REQUIRE_VITALS = "REQUIRE_VITALS",
  REQUIRE_PAIN_ASSESSMENT = "REQUIRE_PAIN_ASSESSMENT",
  CALCULATE_DOSE = "CALCULATE_DOSE"
}
```

### Condition Operator Enum
```typescript
enum ConditionOperatorEnum {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  CONTAINS = "CONTAINS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN"
}
```

### Field Type Enum
```typescript
enum FieldTypeEnum {
  TEXT = "TEXT",
  MEMO = "MEMO",
  NUMBER = "NUMBER",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  SIGNATURE = "SIGNATURE"
}
```

## Schema Validation

The schema includes validation mechanisms to ensure integrity:

1. All field references in conditions and actions must refer to declared fields
2. Rule IDs must be unique
3. Field IDs must be unique
4. Actions must be valid for the targeted field type

## Conclusion

The enhanced MAR schema system provides a comprehensive framework for implementing medication administration workflows. By leveraging the rule system, applications can enforce complex business logic, validation, and workflow requirements while maintaining a flexible, configuration-driven approach.

This approach separates the business rules from application code, allowing for updates to clinical requirements without code changes and supporting the diverse needs of different healthcare environments.