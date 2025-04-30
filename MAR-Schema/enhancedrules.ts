/// <reference path="../../../scriptlibrary" />

// Enhanced Rule System for MAR Schema
// This consolidates dynamicRequirements, medicationRules, validationRules, and signatureWorkflow
// into a more comprehensive rule structure

interface FormSchema {
  name: string,
  multiEntry: boolean,
  fields: Array<Field>,
  rules: Array<EnhancedRule>
}

enum FieldTypeEnum {
  TEXT = "TEXT",
  MEMO = "MEMO",
  NUMBER = "NUMBER",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  SIGNATURE = "SIGNATURE"
}

enum ConditionGroupOperatorEnum {
  OR = "OR",
  AND = "AND"
}

enum ConditionOperatorEnum {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  CONTAINS = "CONTAINS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN"
}

enum GenericRuleValue {
  ANY = "ANY"
}

enum RuleActionEnum {
  HIDE = "HIDE",
  SHOW = "SHOW",
  REQUIRE = "REQUIRE",
  UNREQUIRE = "UNREQUIRE",
  EDITABLE = "EDITABLE",
  UNEDITABLE = "UNEDITABLE",
  VALIDATE = "VALIDATE",    // New action for validation
  COLLECT_SIGNATURE = "COLLECT_SIGNATURE", // New action for signature workflow
  ENFORCE_INTERVAL = "ENFORCE_INTERVAL", // New action for PRN interval
  REQUIRE_VITALS = "REQUIRE_VITALS", // New action for requiring vitals
  REQUIRE_PAIN_ASSESSMENT = "REQUIRE_PAIN_ASSESSMENT", // New action for pain assessment
  CALCULATE_DOSE = "CALCULATE_DOSE" // New action for sliding scale calculation
}

interface Field {
  name: string,
  fieldId: string,
  editable: boolean,
  fieldType: FieldTypeEnum
}

interface EditableField extends Field {
  required: boolean,
  defaultValue?: string,
  fieldType: FieldTypeEnum,
}

interface SelectField extends EditableField {
  options: Array<FieldOptions>
}

interface NumberField extends EditableField {
  min: number,
  max: number
}

interface TextField extends EditableField {
  regex?: string
}

interface FieldOptions {
  name: string,
  exportValue: string
}

// Enhanced Rule Structure
interface EnhancedRule {
  ruleId: string,
  description: string,
  type: RuleTypeEnum, // New property to categorize rules
  conditions: Array<RuleConditionGroups>,
  actions: Array<EnhancedRuleAction>,
}

enum RuleTypeEnum {
  VISIBILITY = "VISIBILITY",
  REQUIREMENT = "REQUIREMENT",
  VALIDATION = "VALIDATION",
  SIGNATURE = "SIGNATURE",
  MEDICATION = "MEDICATION",
  CALCULATION = "CALCULATION"
}

interface RuleConditionGroups {
  operator: ConditionGroupOperatorEnum,
  conditions: Array<RuleCondition>
}

interface RuleCondition {
  field: string,
  operator: ConditionOperatorEnum,
  value: string | GenericRuleValue
}

// Enhanced action structure with specialized configurations
interface EnhancedRuleAction {
  action: RuleActionEnum,
  field: string,
  configuration?: ValidationConfig | IntervalConfig | PainAssessmentConfig | GlucoseConfig | SignatureConfig
}

// Specialized configurations for different rule types
interface ValidationConfig {
  type: 'RANGE' | 'REGEX' | 'CUSTOM',
  min?: number,
  max?: number,
  pattern?: string,
  message?: string,
  customValidator?: string // Reference to a custom validator function
}

interface IntervalConfig {
  minInterval: number, // In hours
  enforceStrict: boolean,
  overridePermission?: string // Permission required to override interval restriction
}

interface PainAssessmentConfig {
  requirePre: boolean,
  requirePost: boolean,
  minDelta?: number, // Required improvement
  interval?: number // Time in minutes to collect post assessment
}

interface GlucoseConfig {
  slidingScale: boolean,
  ranges?: Array<{
    min: number,
    max: number,
    dose: string
  }>
}

interface SignatureConfig {
  type: 'PREP' | 'ADMIN' | 'EFFECTIVENESS' | 'WASTE',
  requireReason?: boolean,
  requireWitness?: boolean,
  requireSupervisor?: boolean
}

// Example of converting the existing rules to the enhanced structure
export function getEnhancedMarRules(): Array<EnhancedRule> {
  const rules: Array<EnhancedRule> = [
    // Rule 1: Exception requires notes (from original rules)
    {
      ruleId: "exceptionRequiresNote",
      description: "When an exception is entered, require a note",
      type: RuleTypeEnum.REQUIREMENT,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "exception",
              operator: ConditionOperatorEnum.EQUALS,
              value: GenericRuleValue.ANY
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.REQUIRE,
          field: "notes"
        }
      ]
    },

    // Rule 2: Pain medication requires pain level (from original rules)
    {
      ruleId: "painMedRequiresPainAssessment",
      description: "When medication is a pain medication, require pain level assessment",
      type: RuleTypeEnum.MEDICATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "drugCategories",
              operator: ConditionOperatorEnum.CONTAINS,
              value: "pain"
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.REQUIRE_PAIN_ASSESSMENT,
          field: "painAssessment",
          configuration: {
            requirePre: true,
            requirePost: true,
            interval: 30 // Check effectiveness after 30 minutes
          } as PainAssessmentConfig
        }
      ]
    },

    // Rule 3: Administered medication requires signature (from original rules)
    {
      ruleId: "administeredRequiresSignature",
      description: "When medication is administered, require signature",
      type: RuleTypeEnum.SIGNATURE,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "adminTime",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.COLLECT_SIGNATURE,
          field: "signature",
          configuration: {
            type: "ADMIN"
          } as SignatureConfig
        }
      ]
    },

    // Rule 4: PRN medication requires effectiveness signature (from original rules)
    {
      ruleId: "prnRequiresEffectiveness",
      description: "When PRN medication is administered, require effectiveness signature",
      type: RuleTypeEnum.SIGNATURE,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "adminTime",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            },
            {
              field: "medicationType",
              operator: ConditionOperatorEnum.EQUALS,
              value: "PRN"
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.COLLECT_SIGNATURE,
          field: "effective",
          configuration: {
            type: "EFFECTIVENESS"
          } as SignatureConfig
        }
      ]
    },

    // Rule 5: PRN Interval Enforcement (from medicationRules)
    {
      ruleId: "prnIntervalRule",
      description: "Enforce minimum interval between PRN medication doses",
      type: RuleTypeEnum.MEDICATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "medicationType",
              operator: ConditionOperatorEnum.EQUALS,
              value: "PRN"
            },
            {
              field: "lastAdminTime",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.ENFORCE_INTERVAL,
          field: "adminTime",
          configuration: {
            minInterval: 4, // hours
            enforceStrict: true,
            overridePermission: "OVERRIDE_PRN_INTERVAL"
          } as IntervalConfig
        }
      ]
    },

    // Rule 6: Blood Pressure Systolic Validation (from validationRules)
    {
      ruleId: "bpsValidation",
      description: "Validate blood pressure systolic value is within acceptable range",
      type: RuleTypeEnum.VALIDATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "bps",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.VALIDATE,
          field: "bps",
          configuration: {
            type: "RANGE",
            min: 0,
            max: 300,
            message: "Systolic blood pressure must be between 0 and 300 mmHg"
          } as ValidationConfig
        }
      ]
    },

    // Rule 7: Blood Pressure Diastolic Validation (from validationRules)
    {
      ruleId: "bpdValidation",
      description: "Validate blood pressure diastolic value is within acceptable range",
      type: RuleTypeEnum.VALIDATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "bpd",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.VALIDATE,
          field: "bpd",
          configuration: {
            type: "RANGE",
            min: 0,
            max: 200,
            message: "Diastolic blood pressure must be between 0 and 200 mmHg"
          } as ValidationConfig
        }
      ]
    },

    // Rule 8: Heart Rate Validation (from validationRules)
    {
      ruleId: "heartRateValidation",
      description: "Validate heart rate is within acceptable range",
      type: RuleTypeEnum.VALIDATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "heartRate",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.VALIDATE,
          field: "heartRate",
          configuration: {
            type: "RANGE",
            min: 0,
            max: 300,
            message: "Heart rate must be between 0 and 300 BPM"
          } as ValidationConfig
        }
      ]
    },

    // Rule 9: Temperature Validation (from validationRules)
    {
      ruleId: "tempValidation",
      description: "Validate temperature is within acceptable range",
      type: RuleTypeEnum.VALIDATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "temp",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.VALIDATE,
          field: "temp",
          configuration: {
            type: "RANGE",
            min: 0,
            max: 120,
            message: "Temperature must be between 0 and 120 degrees"
          } as ValidationConfig
        }
      ]
    },

    // Rule 10: Insulin Glucose Check (from medicationRules)
    {
      ruleId: "insulinRequiresGlucose",
      description: "Insulin administration requires glucose reading",
      type: RuleTypeEnum.MEDICATION,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "medicationType",
              operator: ConditionOperatorEnum.EQUALS,
              value: "INSULIN"
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.REQUIRE,
          field: "glucose"
        },
        {
          action: RuleActionEnum.CALCULATE_DOSE,
          field: "dosage",
          configuration: {
            slidingScale: true,
            ranges: [
              { min: 0, max: 70, dose: "Call physician" },
              { min: 71, max: 150, dose: "0 units" },
              { min: 151, max: 200, dose: "2 units" },
              { min: 201, max: 250, dose: "4 units" },
              { min: 251, max: 300, dose: "6 units" },
              { min: 301, max: 350, dose: "8 units" },
              { min: 351, max: 400, dose: "10 units" },
              { min: 401, max: 9999, dose: "Call physician" }
            ]
          } as GlucoseConfig
        }
      ]
    },

    // Rule 11: Prep Signature Requirement (from signatureWorkflow)
    {
      ruleId: "prepSignatureRequirement",
      description: "Require preparation signature when community setting is enabled",
      type: RuleTypeEnum.SIGNATURE,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "showMARPrepSig",
              operator: ConditionOperatorEnum.EQUALS,
              value: "true"
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.COLLECT_SIGNATURE,
          field: "prepSignature",
          configuration: {
            type: "PREP"
          } as SignatureConfig
        }
      ]
    },

    // Rule 12: Controlled Substance Requires Witness for Waste (new combined rule)
    {
      ruleId: "controlledSubstanceWaste",
      description: "Controlled substances require witness signature for waste",
      type: RuleTypeEnum.SIGNATURE,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "drugCategories",
              operator: ConditionOperatorEnum.CONTAINS,
              value: "controlled"
            },
            {
              field: "waste",
              operator: ConditionOperatorEnum.NOT_EQUALS,
              value: ""
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.COLLECT_SIGNATURE,
          field: "wasteSignature",
          configuration: {
            type: "WASTE",
            requireWitness: true
          } as SignatureConfig
        }
      ]
    },

    // Rule 13: Vitals Required for Specific Exceptions (from dynamicRequirements)
    {
      ruleId: "vitalsRequiredForExceptions",
      description: "Require vitals for specific medication exceptions",
      type: RuleTypeEnum.REQUIREMENT,
      conditions: [
        {
          operator: ConditionGroupOperatorEnum.AND,
          conditions: [
            {
              field: "exception",
              operator: ConditionOperatorEnum.EQUALS,
              value: "LV" // Low Vitals
            }
          ]
        }
      ],
      actions: [
        {
          action: RuleActionEnum.REQUIRE_VITALS,
          field: "vitals"
        }
      ]
    },
  ];

  return rules;
}

// Example of how the enhanced schema function would look
export function getEnhancedMarSchema(): FormSchema {
  const schema: FormSchema = {
    name: "MAR",
    multiEntry: true,
    fields: getMarFields(), // Reuse existing field definitions
    rules: getEnhancedMarRules()
  };

  validateSchema(schema);
  return schema;
}

// Helper functions
function getMarFields(): Array<Field> {
  // This would contain the same field definitions as in the original schema
  // For brevity, returning an empty array here
  return [];
}

function validateSchema(schema: FormSchema): void {
  // Schema validation logic would go here
  // Similar to the original validation but adjusted for the enhanced rule structure
}

/*
Benefits of this consolidated approach:

1. Single Rule Framework - All rules now use a common structure and execution model
2. Self-Contained Rules - Each rule contains its conditions and specialized actions
3. Typed Configurations - Different rule types have specialized configuration options
4. Categorized Rules - Rules are categorized by type for better organization
5. Rule Reuse - Common validation patterns can be applied across different fields
6. Extended Actions - New action types allow for more specific business logic
7. Enhanced Readability - Rules are more descriptive about their purpose
8. Simplified Maintenance - Easier to add/remove/modify rules when they're all in one system
9. Improved Extensibility - New rule types/actions can be added without changing the core structure
10. Better Documentation - Rule type and configurations document the purpose more clearly
*/