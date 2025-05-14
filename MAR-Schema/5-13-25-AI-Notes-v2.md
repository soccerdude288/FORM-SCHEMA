# MAR Schema Dynamic Exceptions Update - 5/13/25

## Changes Overview

We've enhanced the Form Schema system to better support the dynamic exceptions with their associated rules from the MAR API response. The focus was on providing direct support for exceptions that come from the main MAR API response rather than from a separate API endpoint.

## Key Modifications

### 1. Enhanced Schema Interfaces

- Added `ExceptionOptionProperties` interface to represent additional properties for dynamic exceptions:
  ```typescript
  export interface ExceptionOptionProperties {
    vitalsRequired?: boolean;      // Whether vitals are required for this exception
    noteRequired?: boolean;        // Whether notes are required for this exception
    medDestruction?: boolean;      // Whether medication destruction is required
  }
  ```

- Simplified the `Field` interface to focus on inline data for dynamic options:
  ```typescript
  // Options configuration
  options?: FieldOption[];       // For select fields, list of static options
  
  // Dynamic options configuration
  inlineData?: boolean;          // Whether to use inline data from parent request
  optionProperties?: ExceptionOptionProperties[]; // Additional properties for dynamic options
  ```
  
  This approach completely removes the need for separate API calls to fetch dynamic options (dynamicOptionsEndpoint was removed).

- Added new rule type and specialized types to handle dynamic exception behaviors:
  ```typescript
  // New rule type
  DYNAMIC_RULE = "DYNAMIC_RULE"  // Rule determined by dynamic options

  // New requirement types for REQUIRE actions
  export enum RequirementType {
    STANDARD = "STANDARD",       // Regular requirement
    VITALS = "VITALS",           // Require vitals fields
    NOTES = "NOTES",             // Require notes
    MED_DESTRUCTION = "MED_DESTRUCTION" // Require medication destruction
  }
  
  // New visibility types for SHOW/HIDE actions
  export enum VisibilityType {
    STANDARD = "STANDARD",       // Regular visibility
    CONDITIONAL = "CONDITIONAL"  // Visibility controlled by a condition
  }
  ```

- Enhanced the `Action` interface with additional properties:
  ```typescript
  requirementType?: RequirementType; // For REQUIRE actions, the type of requirement
  visibilityType?: VisibilityType;  // For SHOW/HIDE actions, the type of visibility
  targetFields?: string[];       // For group actions, the list of affected fields
  sourceOption?: string;         // For option-based rules, the option value that triggers this
  property?: string;             // For dynamic rules, the property on the option that controls this
  dynamicVisibility?: boolean;   // For dynamic visibility rules
  ```

### 2. MAR Schema Implementation Changes

- Updated the exceptions field definition to use inline data only:
  ```typescript
  {
    id: "exceptions",
    name: "Exception",
    type: FieldType.SINGLE_SELECT,
    editable: true,
    required: false,
    inlineData: true  // Use exceptions from the parent MAR data object
  }
  ```

- Added new dynamic rules for exceptions, using standard actions with type metadata:
  - Requirements:
    - `exceptionRequiresVitals`: Sets `requirementType: RequirementType.VITALS` when an exception has `vitalsRequired=true`
    - `exceptionRequiresNotes`: Sets `requirementType: RequirementType.NOTES` when an exception has `noteRequired=true`
    - `exceptionRequiresMedDestruction`: Sets `requirementType: RequirementType.MED_DESTRUCTION` when an exception has `medDestruction=true`
  - Visibility:
    - `exceptionShowsMedDestruction`: Sets `visibilityType: VisibilityType.CONDITIONAL` with `dynamicVisibility: true` when an exception has `medDestruction=true`

- Enhanced the validator to support these new rule types

### 3. Schema Validation Updates

- Added validation for the new dynamic rule types
- Added specific checks for requirement types:
  - Validates that `RequirementType.VITALS` includes a list of target vital fields
- Added validation for visibility types:
  - Ensures `visibilityType` is specified for dynamic visibility rules
- Added validation that dynamic rules specify the property they reference

## Data Flow

1. The app fetches a MAR entry which includes the `exceptions` array with objects containing properties like:
   ```json
   {
     "name": "Agressive Behavior",
     "value": "22452187",
     "vitalsRequired": true,
     "noteRequired": true,
     "medDestruction": true
   }
   ```

2. The schema now instructs the app to:
   - Use these exceptions directly as options for the exceptions field
   - Apply dynamic rules based on the properties of the selected exception 
   - When an exception is selected, check its properties and enforce rules accordingly

## Benefits of This Approach

1. **Simplified Data Flow**: Eliminates the need for a separate API call for dynamic exceptions
2. **Richer Metadata**: Preserves all properties of each exception for client-side rule processing
3. **Rule Flexibility**: Allows for different combinations of requirements per exception
4. **Self-documenting**: The schema directly shows what properties control which behaviors
5. **Consistency**: Maintains the same pattern for other forms that might use similar dynamic rules

## Next Steps

1. Consider how this approach can be applied to other forms with similar dynamic rule requirements
2. Add an example of how to consume this schema on the client side
3. Create tests to verify the dynamic rule processing works as expected
4. Document the integration with the app.ts API endpoint

## Final Implementation Summary (5/13/25)

We've successfully completed the following tasks:

1. **Enhanced the Schema System** to support dynamic rules based on inline data:
   - Simplified interfaces with focus on inline data instead of external API calls
   - Added support for different requirement and visibility types
   - Created property-based dynamic rule processing

2. **Implemented Complete MAR Schema** with validation:
   - Added full field definitions including validations
   - Implemented dynamic rules for exceptions, requirements and visibility

3. **Created Additional Form Schemas** following the same pattern:
   - `adlSchema.ts` - Schema for Activities of Daily Living
   - `behSchema.ts` - Schema for Behavior Plans
   - `goalSchema.ts` - Schema for Support Strategies/Goals

4. **Standardized Validation** across all schemas:
   - Shared validator for consistency
   - Field validation for required properties and type-specific rules
   - Rule validation for conditions and actions

All schemas now use a consistent, simplified approach focusing on inline data rather than external API calls, while maintaining the flexibility needed for complex business rules. The system is designed to be easily extensible for additional form types while keeping a consistent interface.