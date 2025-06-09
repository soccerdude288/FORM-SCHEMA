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
| `SIGNATURE` | Signature capture | **Special behavior: non-editable after signed** |
| `CALCULATED` | Read-only calculated values | `calculation` configuration |

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

**Signature Field:**
```json
{
  "id": "signature",
  "name": "Signature",
  "type": "SIGNATURE",
  "editable": true,
  "required": false
}
```
*Note: Signature fields become non-editable and display as timestamps once signed.*

**Calculated Field (Sliding Scale):**
```json
{
  "id": "slidingScaleDose",
  "name": "Sliding Scale Dose",
  "type": "CALCULATED",
  "editable": false,
  "required": false,
  "visible": false,
  "calculation": {
    "type": "RANGE_LOOKUP",
    "rangeLookup": {
      "inputField": "vitals.glucose",
      "ranges": [0, 82, 167, 255, 333],
      "values": [2, 3, 4, 5],
      "defaultValue": "No dose recommended"
    }
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
| `VALIDATION` | Validate field values | `VALIDATE`, `MAKE_NON_EDITABLE` |
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
    "field": "selectedException",
    "operator": "ANY_VALUE"
  },
  "action": {
    "type": "REQUIRE",
    "property": "vitalsRequired",
    "targetFields": ["vitals.heartRate", "vitals.bps", "vitals.bpd", "vitals.temp"]
  }
}
```

### Dynamic Visibility with Property Mappings

Show fields based on dynamic array values:

```json
{
  "id": "vitalVisibility",
  "type": "DYNAMIC_RULE",
  "description": "Show vitals based on medication requirements",
  "condition": {
    "field": "dynamicValues.whatVitals",
    "operator": "CONTAINS"
  },
  "action": {
    "type": "SHOW",
    "property": "whatVitals",
    "propertyMappings": [
      {
        "value": "BP",
        "targetFields": ["vitals.bps", "vitals.bpd"]
      },
      {
        "value": "HR",
        "targetFields": ["vitals.heartRate"]
      },
      {
        "value": "GLUCO",
        "targetFields": ["vitals.glucose"]
      }
    ]
  }
}
```

## Calculated Fields

### Overview

Calculated fields provide read-only values computed from other fields or dynamic data. They use the `CALCULATED` field type and support various calculation methods.

### Calculation Types

| Type | Description | Use Case |
|------|-------------|----------|
| `RANGE_LOOKUP` | Map input value to ranges | Sliding scale dosing |
| `FORMULA` | Mathematical expression | Sum, multiply fields |
| `VALUE_LOOKUP` | Direct value mapping | Status translations |
| `CONDITIONAL` | If-then-else logic | Complex business rules |

### Range Lookup (Sliding Scale)

Most commonly used for medication sliding scales:

```json
{
  "type": "RANGE_LOOKUP",
  "rangeLookup": {
    "inputField": "vitals.glucose",
    "ranges": [0, 82, 167, 255, 333],
    "values": [2, 3, 4, 5],
    "defaultValue": "No dose recommended"
  }
}
```

**Logic:** If glucose is 0-81 → 2 units, 82-166 → 3 units, etc.

### Formula Calculations

```json
{
  "type": "FORMULA",
  "formula": {
    "formula": "weight * dosage * 0.5",
    "inputFields": ["weight", "dosage"]
  }
}
```

### Value Lookup

```json
{
  "type": "VALUE_LOOKUP",
  "valueLookup": {
    "inputField": "status",
    "mappings": {
      "A": "Active",
      "I": "Inactive",
      "P": "Pending"
    },
    "defaultValue": "Unknown"
  }
}
```

## Signature Fields

### Behavior

Signature fields have special behavior:

1. **Before Signing:** Editable, shows signature capture interface
2. **After Signing:** Non-editable, displays timestamp from payload
3. **Form State:** When signature exists, related fields become non-editable

### Implementation Example

```json
{
  "id": "signedFieldsNonEditable",
  "type": "VALIDATION",
  "description": "Make fields non-editable when signature is present",
  "condition": {
    "field": "signature",
    "operator": "IS_NOT_EMPTY"
  },
  "action": {
    "type": "MAKE_NON_EDITABLE",
    "targetFields": ["adminTime", "quantity", "notes", "vitals.glucose"]
  }
}
```

### Display Guidelines

- **Unsigned:** Show signature capture widget
- **Signed:** Display timestamp: `"Signed: 2025-06-09 14:30:22"`
- **Label:** Use timestamp from API response, not signature blob

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

## Dynamic Values

The schema system supports dynamic values that can affect form behavior at runtime. These values are provided in the `dynamicValues` property of the form data.

### Dynamic Values Interface

```typescript
interface DynamicValues {
  [key: string]: any;  // Allow any dynamic value to be stored
}
```

### Form-Specific Dynamic Values

Each form type can define its own interface extending the base DynamicValues interface. For example, the MAR form defines:

```typescript
interface MarDynamicValues extends DynamicValues {
  whatVitals?: string[];        // Array of vitals that apply to this entry
  slidingScale?: {              // Sliding scale configuration
    start: number[];           // Range boundaries
    doses: (number | string)[]; // Corresponding doses
  };
}
```

### Using Dynamic Values

Dynamic values can be used to:
- Control field visibility and requirements
- Configure calculations
- Modify form behavior based on runtime data

Example of MAR-specific dynamic values:
```json
{
  "dynamicValues": {
    "whatVitals": ["bps", "bpd", "heartRate"],
    "slidingScale": {
      "start": [0, 82, 167, 255, 333],
      "doses": [2, 3, 4, 5]
    }
  }
}
```

## Signature Fields

Signature fields have special behavior in the schema system:

1. **Initial State**:
   - Editable: true
   - Required: false (unless specified otherwise)
   - Type: SIGNATURE

2. **After Signing**:
   - Automatically becomes non-editable
   - Displays the signature timestamp
   - Cannot be modified or re-signed

Example:
```json
{
  "id": "signature",
  "name": "Signature",
  "type": "SIGNATURE",
  "editable": true,
  "required": false
}
```

## Sliding Scale Implementation

The sliding scale is a specialized calculation type that determines medication dosage based on input values (typically glucose readings).

### Configuration

```typescript
interface SlidingScaleConfig {
  inputField: string;            // Field providing the input value (e.g., "glucose")
  ranges: number[];              // Range boundaries
  values: (number | string)[];   // Corresponding doses
  defaultValue?: any;            // Value if input doesn't match any range
}
```

### Example

```json
{
  "id": "slidingScaleDose",
  "name": "Sliding Scale Dose",
  "type": "CALCULATED",
  "editable": false,
  "required": false,
  "calculation": {
    "type": "RANGE_LOOKUP",
    "rangeLookup": {
      "inputField": "glucose",
      "ranges": [0, 82, 167, 255, 333],
      "values": [2, 3, 4, 5],
      "defaultValue": "No dose recommended"
    }
  }
}
```

The ranges and values can be dynamically configured through the `dynamicValues.slidingScale` property.

This documentation provides the foundation for implementing a robust form framework that can consume and process any configuration of the form schema system.