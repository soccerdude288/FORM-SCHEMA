# Form Schema Documentation

This document provides comprehensive documentation for consumers of the form schema system defined in `@appApiFiles/schemas/formSchemaInterfaces.ts`. The schema system enables dynamic form generation with complex business rules, validation, and conditional logic.

## Overview

The form schema system is a JSON-based configuration that defines:
- **Form structure** - Fields, types, and basic properties
- **Business rules** - Conditional logic for visibility, requirements, and validation
- **Dynamic behavior** - Rules that adapt based on runtime data

## Core Schema Structure

### FormSchema (Root Object)

```typescript
interface FormSchema {
  name: string;          // Form identifier
  multiEntry: boolean;   // Whether form supports multiple entries
  fields: Field[];       // Array of field definitions
  rules: Rule[];         // Array of business rules
  version?: string;      // Optional schema version
}
```

**Example:**
```json
{
  "name": "MAR",
  "multiEntry": true,
  "version": "1.0.0",
  "fields": [...],
  "rules": [...]
}
```

## Field Definitions

### Field Interface

```typescript
interface Field {
  id: string;              // Unique field identifier
  name: string;            // Display label
  type: FieldType;         // Field type (see FieldType enum)
  editable: boolean;       // Whether user can modify
  required: boolean;       // Default requirement state
  options?: FieldOption[]; // For select fields
  inlineData?: boolean;    // Use dynamic data from parent
  validation?: Validation; // Field validation rules
}
```

### Field Types

| Type | Description | Additional Properties |
|------|-------------|----------------------|
| `TEXT` | Single-line text input | `validation.pattern` for regex |
| `MEMO` | Multi-line text area | `validation.min/max` for length |
| `NUMBER` | Numeric input | `validation.min/max` for range |
| `DATE` | Date picker | None |
| `DATETIME` | Date and time picker | None |
| `SINGLE_SELECT` | Dropdown/radio buttons | `options` or `inlineData` |
| `MULTI_SELECT` | Checkboxes | `options` or `inlineData` |
| `SIGNATURE` | Signature capture | None |

### Field Examples

**Text Field:**
```json
{
  "id": "medication",
  "name": "Medication",
  "type": "TEXT",
  "editable": false,
  "required": false
}
```

**Select Field with Static Options:**
```json
{
  "id": "routeOfAdmin",
  "name": "Route of Administration",
  "type": "SINGLE_SELECT",
  "editable": true,
  "required": true,
  "options": [
    { "name": "Oral", "value": "PO" },
    { "name": "Subcutaneous", "value": "SQ" }
  ]
}
```

**Select Field with Dynamic Options:**
```json
{
  "id": "exceptions",
  "name": "Exception",
  "type": "SINGLE_SELECT",
  "editable": true,
  "required": false,
  "inlineData": true
}
```

**Number Field with Validation:**
```json
{
  "id": "heartRate",
  "name": "Heart Rate",
  "type": "NUMBER",
  "editable": true,
  "required": false,
  "validation": {
    "min": 0,
    "max": 300
  }
}
```

## Validation System

### Validation Interface

```typescript
interface Validation {
  required?: boolean;    // Override default required state
  min?: number;         // Min value/length
  max?: number;         // Max value/length
  pattern?: string;     // Regex pattern for text fields
  message?: string;     // Custom error message
}
```

### Validation Examples

**Text with Pattern:**
```json
{
  "validation": {
    "pattern": "^[A-Z]{2,3}$",
    "message": "Must be 2-3 uppercase letters"
  }
}
```

**Number Range:**
```json
{
  "validation": {
    "min": 0,
    "max": 10,
    "message": "Pain level must be 0-10"
  }
}
```

## Business Rules System

### Rule Interface

```typescript
interface Rule {
  id: string;              // Unique rule identifier
  type: RuleType;          // Rule category
  description?: string;    // Human-readable description
  condition: Condition;    // When rule applies
  action: Action;          // What happens when triggered
}
```

### Rule Types

| Type | Purpose | Valid Actions |
|------|---------|---------------|
| `VISIBILITY` | Show/hide fields | `SHOW`, `HIDE` |
| `REQUIREMENT` | Make fields required | `REQUIRE`, `OPTIONAL` |
| `VALIDATION` | Validate field values | `VALIDATE` |
| `CALCULATION` | Calculate field values | `CALCULATE` |
| `OPTION_FILTER` | Filter select options | `FILTER_OPTIONS` |
| `DYNAMIC_RULE` | Dynamic behavior based on option properties | `REQUIRE`, `SHOW`, `HIDE` |

### Conditions

```typescript
interface Condition {
  field: string;                    // Field ID to check
  operator: ConditionOperator;      // Comparison type
  value?: any;                      // Value to compare against
  combineOperator?: 'AND' | 'OR';   // Chain conditions
  nextCondition?: Condition;        // Next condition in chain
}
```

### Condition Operators

| Operator | Description | Requires Value |
|----------|-------------|----------------|
| `EQUALS` | Exact match | Yes |
| `NOT_EQUALS` | Not equal | Yes |
| `CONTAINS` | Contains substring/value | Yes |
| `STARTS_WITH` | Starts with string | Yes |
| `ENDS_WITH` | Ends with string | Yes |
| `GREATER_THAN` | Numeric comparison | Yes |
| `LESS_THAN` | Numeric comparison | Yes |
| `IS_EMPTY` | Field has no value | No |
| `IS_NOT_EMPTY` | Field has any value | No |
| `ANY_VALUE` | Any option selected | No |

### Actions

```typescript
interface Action {
  type: ActionType;              // Action to perform
  target: string;                // Field ID to affect
  value?: any;                   // Value for calculations
  requirementType?: RequirementType; // Type of requirement
  visibilityType?: VisibilityType;   // Type of visibility
  targetFields?: string[];       // Multiple fields for group actions
  property?: string;             // Dynamic property name
}
```

## Rule Examples

### Basic Visibility Rule

```json
{
  "id": "hideVitalsInitially",
  "type": "VISIBILITY",
  "description": "Hide vital signs until medication is administered",
  "condition": {
    "field": "adminTime",
    "operator": "IS_EMPTY"
  },
  "action": {
    "type": "HIDE",
    "target": "heartRate"
  }
}
```

### Requirement Rule with Chained Conditions

```json
{
  "id": "painMedRequiresPostPain",
  "type": "REQUIREMENT",
  "description": "Pain medication administered requires post-pain assessment",
  "condition": {
    "field": "drugCategories",
    "operator": "CONTAINS",
    "value": "pain",
    "combineOperator": "AND",
    "nextCondition": {
      "field": "adminTime",
      "operator": "IS_NOT_EMPTY"
    }
  },
  "action": {
    "type": "REQUIRE",
    "target": "postPain"
  }
}
```

### Dynamic Rule

Dynamic rules adapt behavior based on properties of selected options:

```json
{
  "id": "exceptionRequiresVitals",
  "type": "DYNAMIC_RULE",
  "description": "Exception with vitals requirement triggers vital sign collection",
  "condition": {
    "field": "exceptions",
    "operator": "ANY_VALUE"
  },
  "action": {
    "type": "REQUIRE",
    "target": "heartRate",
    "property": "vitalsRequired",
    "requirementType": "VITALS",
    "targetFields": ["heartRate", "bps", "bpd", "temp"]
  }
}
```

## Dynamic Options and Properties

### Overview

Fields with `inlineData: true` receive their options from runtime data. These options can have additional properties that drive dynamic rules.

### Option Properties

```typescript
interface ExceptionOptionProperties {
  vitalsRequired?: boolean;    // Triggers vital sign requirements
  noteRequired?: boolean;      // Triggers note requirements
  medDestruction?: boolean;    // Triggers medication destruction workflow
}
```

### Implementation Pattern

1. **Field Definition** - Mark field as `inlineData: true`
2. **Dynamic Rule** - Create rule with `type: "DYNAMIC_RULE"`
3. **Property Checking** - Use `action.property` to specify which option property to check
4. **Conditional Behavior** - Rule triggers when selected option has `property: true`

### Example Data Structure

```json
{
  "exceptions": [
    {
      "name": "Patient Refused",
      "value": "refused",
      "vitalsRequired": false,
      "noteRequired": true,
      "medDestruction": false
    },
    {
      "name": "Medication Error",
      "value": "med_error",
      "vitalsRequired": true,
      "noteRequired": true,
      "medDestruction": true
    }
  ]
}
```

## Implementation Guidelines

### 1. Schema Validation

Always validate schemas before use:

```typescript
import { SchemaValidator } from './marSchema';

const validator = new SchemaValidator();
try {
  validator.validateSchema(schema);
} catch (error) {
  console.error('Schema validation failed:', error.message);
}
```

### 2. Rule Processing Order

Process rules in this order:
1. **Visibility rules** - Determine which fields are visible
2. **Requirement rules** - Set required state
3. **Dynamic rules** - Apply option-based logic
4. **Validation rules** - Validate field values

### 3. Condition Evaluation

For chained conditions:
```typescript
function evaluateCondition(condition: Condition, formData: any): boolean {
  const result = evaluateSingleCondition(condition, formData);
  
  if (condition.nextCondition) {
    const nextResult = evaluateCondition(condition.nextCondition, formData);
    return condition.combineOperator === 'AND' 
      ? result && nextResult 
      : result || nextResult;
  }
  
  return result;
}
```

### 4. Dynamic Rule Processing

```typescript
function processDynamicRule(rule: Rule, selectedOption: any): boolean {
  if (rule.type === 'DYNAMIC_RULE') {
    const property = rule.action.property;
    return selectedOption && selectedOption[property] === true;
  }
  return false;
}
```

### 5. Field State Management

Track field states:
```typescript
interface FieldState {
  visible: boolean;
  required: boolean;
  value: any;
  errors: string[];
}
```

## Error Handling

### Common Validation Errors

1. **Missing Field References** - Rules reference non-existent fields
2. **Circular Dependencies** - Rules create infinite loops
3. **Invalid Action Types** - Action doesn't match rule type
4. **Missing Required Properties** - Dynamic rules without property specification

### Error Messages

- Field validation: `"Field {id} has invalid {property}"`
- Rule validation: `"Rule {id} references non-existent field: {field}"`
- Action validation: `"Action type {type} not valid for rule type {ruleType}"`

## Best Practices

### Field Design
- Use descriptive field IDs (`heartRate` not `hr`)
- Set appropriate validation ranges
- Provide clear field names for UI display

### Rule Design
- Write descriptive rule descriptions
- Keep conditions simple and readable
- Group related rules logically
- Use dynamic rules for option-driven behavior

### Performance
- Minimize rule complexity
- Use targeted field references
- Cache validation results where possible

### Testing
- Test all rule combinations
- Validate with edge case data
- Ensure proper error handling

## Version Compatibility

The schema system supports versioning through the optional `version` field. When implementing:

1. **Version Checking** - Validate schema version compatibility
2. **Migration Support** - Handle schema upgrades gracefully
3. **Backward Compatibility** - Support older schema versions when possible

This documentation provides the foundation for implementing a robust form framework that can consume and process any configuration of the form schema system.