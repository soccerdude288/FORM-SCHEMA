# Schema Simplification Notes - 5/13/25

## Current Implementation Analysis

The current schema implementation in `appApiFiles/` is comprehensive but has grown quite complex. It includes:

1. Multiple specialized interfaces for different rule types
2. Nested condition structures
3. Complex rule processing logic
4. Specialized validation systems
5. Dynamic rule sources with multi-layered processing

## Simplified Schema Design

The simplified design focuses on these core requirements:

1. Form definition with field list and their properties
2. Dynamic required field rules
3. Dynamic show/hide rules
4. Support for both static and dynamic option values
5. Field editability control

### Core Schema Structure

```typescript
interface FormSchema {
  name: string;                  // Form name (e.g., "MAR")
  multiEntry: boolean;           // Whether this is a multi-entry form
  fields: Field[];               // List of fields in the form
  rules: Rule[];                 // List of business rules
}
```

### Field Structure

```typescript
interface Field {
  id: string;                    // Unique field identifier
  name: string;                  // Display name
  type: FieldType;               // Field type (text, number, select, etc.)
  editable: boolean;             // Whether field is editable
  required: boolean;             // Whether field is required by default
  options?: FieldOption[];       // For select fields, list of options
  dynamicOptions?: string;       // For dynamic options, reference to data source
  validation?: Validation;       // Validation rules for the field
}
```

### Rule Structure

```typescript
interface Rule {
  id: string;                    // Unique rule identifier
  type: RuleType;                // VISIBILITY, REQUIREMENT, CALCULATION, etc.
  description?: string;          // Human-readable description
  condition: Condition;          // When this rule applies
  action: Action;                // What happens when rule applies
}
```

### Simplified Condition Structure

```typescript
interface Condition {
  field: string;                 // Field ID this condition checks
  operator: ConditionOperator;   // EQUALS, NOT_EQUALS, CONTAINS, etc.
  value: any;                    // Value to compare against
  combineOperator?: 'AND'|'OR';  // How to combine with next condition
  nextCondition?: Condition;     // Optional next condition in chain
}
```

### Action Structure

```typescript
interface Action {
  type: ActionType;              // SHOW, HIDE, REQUIRE, MAKE_OPTIONAL
  target: string;                // Field ID this action affects
  value?: any;                   // Optional value for calculation actions
}
```

## Implementation Benefits

1. **Simpler Rule Definition**: Linear condition chaining instead of nested arrays
2. **Clearer Field Properties**: All field properties in one place
3. **Unified Rule System**: Simplified rule processing with one rule format for all types
4. **Explicit Dynamic Options**: Clear indication of where dynamic options come from
5. **Generic for Other Forms**: Structure is simple enough to apply to any form type

## Migration Plan

1. Create new interface definitions in `new-interfaces.ts`
2. Implement simplified schema functions in `new-schemaFunctions.ts`
3. Add helper functions for rule processing in `new-payloadFunctions.ts`
4. Ensure backward compatibility with existing API calls

## Next Steps

1. Complete implementation of new schema files
2. Create validation functions to verify schema integrity
3. Add converter functions to translate from old schema if needed
4. Test with MAR form as proof of concept
5. Document usage pattern for other forms

## Implementation Summary (5/13/25)

Based on further discussion and refinement, we've consolidated the implementation to focus exclusively on the MAR schema with simplicity as the primary goal. We've created two new files:

1. `formSchemaInterfaces.ts`: Core data structures and types for the schema system
   - Defines field types, condition operators, rule types, and action types
   - Provides interfaces for fields, conditions, rules, and validation
   - Includes support for dynamic options specification
   - Clearly named to avoid confusion with the existing interfaces.ts file

2. `marSchema.ts`: Complete MAR schema implementation
   - Contains the `SchemaValidator` class for schema validation
   - Provides the `getMarSchema()` function that returns the complete MAR definition
   - Includes validation logic to ensure schema integrity
   - Self-contained with no dependencies outside of the interfaces

The updated implementation is more focused and maintains these key principles:
- Clear separation between interface definitions and schema implementation
- Self-validating schema that can detect structural issues
- Detailed field definitions with proper validation rules
- Comprehensive business rule definitions using the simplified condition structure

### Important Clarifications

1. The schema is a static definition that instructs the app how to display a form and handle its business rules. It's not intended for runtime data processing on the server side.

2. The app will make a single request for the schema and then apply the rules client-side based on user input.

3. For dynamic options (like exceptions), the schema specifies endpoints that the app should call to retrieve the options, rather than embedding the options directly.

4. The implementation focuses solely on the MAR schema for now, with a design that can be easily extended to other forms as needed.

### Next Steps

1. Integrate the schema with the API endpoint in app.ts
2. Create a simple test to verify schema validation works correctly
3. Document the schema format for future form implementations
4. Consider adding schema versioning to support backward compatibility

## Final Summary for Future Sessions

### MAR Schema System - Implementation Summary

We've developed a simplified schema definition system for the MAR form that can be extended to other forms in the future. The implementation consists of two key files:

1. **`MAR-Schema/formSchemaInterfaces.ts`**
   - Contains all interface and enum definitions
   - Provides a clean structure for fields, rules, conditions, and actions
   - Uses a linear condition chaining approach instead of nested arrays
   - Includes support for validation and dynamic options

2. **`MAR-Schema/marSchema.ts`**
   - Implements the MAR schema using the interfaces
   - Contains a schema validator to ensure integrity
   - Defines all fields with their properties (editable, required, validation)
   - Implements business rules for field requirements and visibility
   - Specifies how dynamic data (like exceptions) should be fetched

### Key Design Principles

1. **Static Schema Definition**: The schema provides a static definition that tells the app how to display the form and apply business rules.

2. **Client-Side Rule Processing**: The app requests the schema once and processes rules on the client side.

3. **Dynamic Options Handling**: For fields with dynamic options, the schema specifies endpoints where the app can fetch the options.

4. **Self-Validation**: The schema includes validation to catch structural issues early.

### Integration Notes

To integrate this into the app:

1. Import the `getMarSchema()` function from `marSchema.ts`
2. Add an API endpoint that returns this schema
3. Ensure the app can properly parse and apply the schema rules
4. Implement the dynamic options endpoints referenced in the schema

### Extending to Other Forms

This approach can be extended to other forms by:

1. Using the same interfaces from `formSchemaInterfaces.ts`
2. Creating new schema files for each form type
3. Following the same pattern of fields and rules definition

### Next Development Tasks

1. Integrate with `app.ts` to expose the schema through an API endpoint
2. Create tests to verify schema integrity and rule processing
3. Implement client-side handling in the app
4. Consider versioning for backward compatibility

This implementation properly addresses the requirements for defining fields, dynamic required/visibility rules, static/dynamic options, and field editability in a simplified, maintainable way.