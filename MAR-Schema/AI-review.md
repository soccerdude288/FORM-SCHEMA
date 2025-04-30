# MAR System Analysis and Schema Implementation Review

## 1. System Overview

The Medication Administration Record (MAR) system is a complex multi-entry form within BlueStep that manages medication administration for residents. Key characteristics:

- **Form Type**: Multi-entry form on Individual - Resident Records
- **Layout**: Custom Merge Report-based layout (not using Generic Layout)
- **Dynamic Components**: Behavior controlled by Community Record settings
- **Primary Files**:
  - `mardetail.bluestep`: Main layout and business logic
  - `conditionalrequired.bluestep`: Business rule enforcement
  - `marformgraphqlresults.json`: Field configurations
  - `schemafunctions.ts`: Current schema implementation

## 2. Field Analysis

### Core Fields
- **Read-Only Fields**:
  - Medication Name
  - MAR Instructions
  - Quantity Unit
  - Diagnosis
- **Editable Fields**:
  - Quantity Administered
  - Notes
  - Exceptions (dynamic)
  - Administration Time
  - Vitals Fields
  - Signature

### Vitals Fields
- Blood Pressure (Systolic/Diastolic)
- Heart Rate
- Temperature
- Glucose/Blood Sugar
- Respiratory Rate
- Weight
- O2 Saturation

### Special Fields
- Pain Level Tracking (Pre/Post)
- Medication Effectiveness
- PRN Interval Tracking
- Exception Handling

## 3. Business Rules Analysis

### Dynamic Requirements
1. **Exception-Based Requirements**:
   - Notes required for certain exceptions
   - Vitals required for specific exceptions
   - "Loss of meds" tracking

2. **Medication-Specific Rules**:
   - PRN interval rules
   - Pain level tracking requirements
   - Glucose sliding scale requirements
   - Medication effectiveness tracking

3. **Signature Requirements**:
   - Prep Signature
   - Administration Signature
   - Effectiveness Follow-up Signature

### Conditional Logic
- Field visibility based on medication type
- Required fields based on exception type
- Dynamic validation rules
- Medication-specific business rules

## 4. Schema Implementation Recommendations

### Current Schema Structure
The existing `schemafunctions.ts` provides a good foundation with:
- Form schema interface
- Field type definitions
- Rule condition/action framework
- Basic field type implementations

### Recommended Enhancements

1. **Dynamic Field Requirements**:
```typescript
interface DynamicFieldRequirement {
  fieldId: string;
  requiredWhen: Array<{
    field: string;
    operator: ConditionOperatorEnum;
    value: string | GenericRuleValue;
  }>;
}
```

2. **Medication-Specific Rules**:
```typescript
interface MedicationRule {
  medicationType: string;
  rules: Array<{
    type: 'PRN_INTERVAL' | 'PAIN_TRACKING' | 'VITALS_REQUIRED';
    configuration: any;
  }>;
}
```

3. **Enhanced Validation Framework**:
```typescript
interface ValidationRule {
  fieldId: string;
  validators: Array<{
    type: 'RANGE' | 'REGEX' | 'CUSTOM';
    configuration: any;
  }>;
}
```

4. **Signature Workflow**:
```typescript
interface SignatureWorkflow {
  steps: Array<{
    type: 'PREP' | 'ADMIN' | 'EFFECTIVENESS';
    required: boolean;
    conditions?: Array<RuleCondition>;
  }>;
}
```

## 5. Implementation Considerations

1. **Dynamic Field Loading**:
   - Implement field loading based on medication type
   - Support dynamic validation rules
   - Handle conditional visibility

2. **Business Rule Processing**:
   - Create rule processor for medication-specific rules
   - Implement PRN interval calculations
   - Handle pain level tracking logic

3. **Data Validation**:
   - Implement comprehensive validation framework
   - Support dynamic validation rules
   - Handle cross-field validation

4. **UI Considerations**:
   - Support dynamic field visibility
   - Handle complex validation feedback
   - Implement signature workflow UI

## 6. Future Enhancements

1. **Schema Versioning**:
   - Implement version control for schema changes
   - Support backward compatibility

2. **Rule Management**:
   - Create rule management interface
   - Support rule testing and validation

3. **Performance Optimization**:
   - Implement caching for frequently used rules
   - Optimize validation processing

4. **Documentation**:
   - Create comprehensive documentation
   - Include examples and use cases

## 7. Questions and Assumptions

1. **Questions**:
   - How are medication types defined in the system?
   - What is the exact workflow for PRN medications?
   - How are vitals requirements determined?
   - What is the process for handling medication holds?

2. **Assumptions**:
   - All business rules can be represented in the schema
   - The app will handle dynamic field loading
   - Validation rules can be processed client-side
   - The schema will support all current and future requirements

## 8. Recommendations for Future Forms

1. **Schema Design**:
   - Start with comprehensive field analysis
   - Document all business rules early
   - Consider dynamic requirements from the start

2. **Implementation**:
   - Use modular design for rules
   - Implement comprehensive validation
   - Support dynamic field requirements

3. **Testing**:
   - Create test cases for all business rules
   - Validate schema against real-world scenarios
   - Test performance with large datasets
