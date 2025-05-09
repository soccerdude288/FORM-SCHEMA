/// <reference path="../../../scriptlibrary" />

import {
  FormSchema,
  Field,
  TextField,
  NumberField,
  SelectField,
  FieldTypeEnum,
  ConditionGroupOperatorEnum,
  ConditionOperatorEnum,
  GenericRuleValue,
  RuleActionEnum,
  Rule,
  DynamicFieldRequirement,
  MedicationRule,
  ValidationRule,
  SignatureWorkflow,
  DynamicRuleSource,
  BaseRuleProcessor,
  validateSchema
} from './schemaFramework';

/**
 * MAR Rule Processor extending the base processor for MAR-specific functionality
 */
export class MarRuleProcessor extends BaseRuleProcessor {
  // Add any MAR-specific rule processing methods here if needed
}

// Create a singleton instance
export const marRuleProcessor = new MarRuleProcessor();

/**
 * Returns a schema for the MAR form
 */
export function getMarSchema(): FormSchema {
  let rtn: FormSchema = {
    name: "MAR",
    multiEntry: true,
    fields: getMarFields(),
    rules: getMarRules(),
    dynamicRequirements: getMarDynamicRequirements(),
    medicationRules: getMarMedicationRules(),
    validationRules: getMarValidationRules(),
    signatureWorkflow: getMarSignatureWorkflow(),
    dynamicRuleSources: getMarDynamicRuleSources()
  };

  validateSchema(rtn);
  return rtn;
}

/**
 * Get dynamic rule sources for the MAR schema
 * These define where dynamically generated rules come from in related records
 */
function getMarDynamicRuleSources(): Array<DynamicRuleSource> {
  return [
    {
      sourceField: "adminExRel",
      ruleType: "REQUIREMENT",
      fieldMapping: {
        requiredField: "noteReq"
      },
      targetField: "notes",
      sourceType: "MULTI",
      description: "Exception requirements for notes based on selected exception"
    },
    {
      sourceField: "adminExRel",
      ruleType: "REQUIREMENT",
      fieldMapping: {
        requiredField: "vitalsReq"
      },
      targetField: "vitals",
      sourceType: "MULTI",
      description: "Exception requirements for vitals based on selected exception"
    },
    {
      sourceField: "adminExRel",
      ruleType: "VISIBILITY",
      fieldMapping: {
        visibilityField: "medDestruct"
      },
      targetField: "medDestruction",
      sourceType: "MULTI",
      description: "Exception control of medication destruction field visibility"
    }
  ];
}

/**
 * Returns the field definitions for the MAR form
 */
function getMarFields(): Array<Field> {
  const medicationField: Field = {
    name: "Medication",
    editable: false,
    fieldId: "medication",
    fieldType: FieldTypeEnum.TEXT
  };

  const medicationTextUrlField: TextField = {
    name: "Medication Text/URL",
    editable: true,
    fieldId: "medicationTextUrl",
    required: false,
    fieldType: FieldTypeEnum.TEXT
  };

  const dosageField: TextField = {
    name: "Dosage",
    editable: true,
    fieldId: "dosage",
    required: true,
    fieldType: FieldTypeEnum.TEXT
  };

  const diagnosisField: TextField = {
    name: "Diagnosis",
    editable: true,
    fieldId: "diagnosis",
    required: false,
    fieldType: FieldTypeEnum.TEXT
  };

  const routeOfAdminField: SelectField = {
    name: "Route of Administration",
    editable: true,
    fieldId: "routeOfAdmin",
    required: true,
    fieldType: FieldTypeEnum.SINGLE_SELECT,
    options: [
      { name: "Oral", exportValue: "PO" },
      { name: "Subcutaneous", exportValue: "SQ" },
      { name: "Intramuscular", exportValue: "IM" },
      { name: "Transdermal", exportValue: "T" }
    ]
  };

  const drugCategoriesField: SelectField = {
    name: "Drug Categories",
    editable: true,
    fieldId: "drugCategories",
    required: false,
    fieldType: FieldTypeEnum.MULTI_SELECT,
    options: [
      { name: "Pain", exportValue: "pain" },
      { name: "Controlled", exportValue: "controlled" }
    ]
  };

  const adminTimeField: TextField = {
    name: "Date/Time Administered",
    editable: true,
    fieldId: "adminTime",
    required: false,
    fieldType: FieldTypeEnum.TEXT
  };

  const signatureField: Field = {
    name: "Signature",
    editable: true,
    fieldId: "signature",
    fieldType: FieldTypeEnum.SIGNATURE
  };

  const exceptionField: SelectField = {
    name: "Exception",
    editable: true,
    fieldId: "exception",
    required: false,
    fieldType: FieldTypeEnum.SINGLE_SELECT,
    options: [
      { name: "Refused", exportValue: "R" },
      { name: "Held", exportValue: "H" },
      { name: "Not Available", exportValue: "NA" }
    ]
  };

  const notesField: TextField = {
    name: "Notes",
    editable: true,
    fieldId: "notes",
    required: false,
    fieldType: FieldTypeEnum.TEXT
  };

  const instructionsField: Field = {
    name: "Instructions",
    editable: false,
    fieldId: "instructions",
    fieldType: FieldTypeEnum.MEMO
  };

  // Vitals Fields
  const bloodPressureSystolicField: NumberField = {
    name: "Blood Pressure Systolic",
    editable: true,
    fieldId: "bps",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 300
  };

  const bloodPressureDiastolicField: NumberField = {
    name: "Blood Pressure Diastolic",
    editable: true,
    fieldId: "bpd",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 200
  };

  const heartRateField: NumberField = {
    name: "Heart Rate",
    editable: true,
    fieldId: "heartRate",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 300
  };

  const temperatureField: NumberField = {
    name: "Temperature",
    editable: true,
    fieldId: "temp",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 120
  };

  const glucoseField: NumberField = {
    name: "Glucose/Blood sugar",
    editable: true,
    fieldId: "glucose",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 1000
  };

  const respiratoryRateField: NumberField = {
    name: "Respiratory Rate",
    editable: true,
    fieldId: "respRate",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 100
  };

  const weightField: NumberField = {
    name: "Weight",
    editable: true,
    fieldId: "weight",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 1000
  };

  const oxygenSaturationField: NumberField = {
    name: "O2 Sats",
    editable: true,
    fieldId: "oxygen",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 100
  };

  const prePainLevelField: NumberField = {
    name: "Pre Pain Level",
    editable: true,
    fieldId: "prePain",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 10
  };

  const postPainLevelField: NumberField = {
    name: "Post Pain Level",
    editable: true,
    fieldId: "postPain",
    required: false,
    fieldType: FieldTypeEnum.NUMBER,
    min: 0,
    max: 10
  };

  const effectivenessField: Field = {
    name: "Effectiveness",
    editable: true,
    fieldId: "effective",
    fieldType: FieldTypeEnum.SIGNATURE
  };

  return [
    medicationField,
    medicationTextUrlField,
    dosageField,
    diagnosisField,
    routeOfAdminField,
    drugCategoriesField,
    adminTimeField,
    signatureField,
    exceptionField,
    notesField,
    instructionsField,
    bloodPressureSystolicField,
    bloodPressureDiastolicField,
    heartRateField,
    temperatureField,
    glucoseField,
    respiratoryRateField,
    weightField,
    oxygenSaturationField,
    prePainLevelField,
    postPainLevelField,
    effectivenessField
  ];
}

/**
 * Returns the static rules for the MAR form
 */
function getMarRules(): Array<Rule> {
  // Rule 1: Exception requires notes
  const exceptionRequiresNotesRule: Rule = {
    ruleId: "exceptionRequiresNote",
    description: "When an exception is entered, require a note",
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
    action: [
      {
        action: RuleActionEnum.REQUIRE,
        field: "notes"
      }
    ]
  };

  // Rule 2: Pain medication requires pain level
  const painMedRequiresPainLevelRule: Rule = {
    ruleId: "painMedRequiresPainLevel",
    description: "When medication is a pain medication, require pain level",
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
    action: [
      {
        action: RuleActionEnum.REQUIRE,
        field: "prePain"
      },
      {
        action: RuleActionEnum.REQUIRE,
        field: "postPain"
      }
    ]
  };

  // Rule 3: Administered medication requires signature
  const administeredRequiresSignatureRule: Rule = {
    ruleId: "administeredRequiresSignature",
    description: "When medication is administered, require signature",
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
    action: [
      {
        action: RuleActionEnum.REQUIRE,
        field: "signature"
      }
    ]
  };

  // Rule 4: PRN medication requires effectiveness signature
  const prnRequiresEffectivenessRule: Rule = {
    ruleId: "prnRequiresEffectiveness",
    description: "When PRN medication is administered, require effectiveness signature",
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
            field: "drugCategories",
            operator: ConditionOperatorEnum.CONTAINS,
            value: "pain"
          }
        ]
      }
    ],
    action: [
      {
        action: RuleActionEnum.REQUIRE,
        field: "effective"
      }
    ]
  };

  return [
    exceptionRequiresNotesRule,
    painMedRequiresPainLevelRule,
    administeredRequiresSignatureRule,
    prnRequiresEffectivenessRule
  ];
}

/**
 * Returns the dynamic field requirements for the MAR form
 */
function getMarDynamicRequirements(): Array<DynamicFieldRequirement> {
  return [
    {
      fieldId: "notes",
      requiredWhen: [
        {
          field: "exception",
          operator: ConditionOperatorEnum.EQUALS,
          value: "R" // Refused
        },
        {
          field: "exception",
          operator: ConditionOperatorEnum.EQUALS,
          value: "H" // Held
        }
      ]
    },
    {
      fieldId: "vitals",
      requiredWhen: [
        {
          field: "exception",
          operator: ConditionOperatorEnum.EQUALS,
          value: "LV" // Low Vitals
        }
      ]
    }
  ];
}

/**
 * Returns the medication rules for the MAR form
 */
function getMarMedicationRules(): Array<MedicationRule> {
  return [
    {
      medicationType: "PRN",
      rules: [
        {
          type: "PRN_INTERVAL",
          configuration: {
            minInterval: 4, // hours
            effectivenessRequired: true
          }
        }
      ]
    },
    {
      medicationType: "PAIN",
      rules: [
        {
          type: "PAIN_TRACKING",
          configuration: {
            prePainRequired: true,
            postPainRequired: true,
            interval: 30 // minutes
          }
        }
      ]
    },
    {
      medicationType: "INSULIN",
      rules: [
        {
          type: "GLUCOSE_SCALE",
          configuration: {
            glucoseRequired: true,
            slidingScale: true
          }
        }
      ]
    }
  ];
}

/**
 * Returns the validation rules for the MAR form
 */
function getMarValidationRules(): Array<ValidationRule> {
  return [
    {
      fieldId: "bps",
      validators: [
        {
          type: "RANGE",
          configuration: {
            min: 0,
            max: 300
          }
        }
      ]
    },
    {
      fieldId: "bpd",
      validators: [
        {
          type: "RANGE",
          configuration: {
            min: 0,
            max: 200
          }
        }
      ]
    },
    {
      fieldId: "heartRate",
      validators: [
        {
          type: "RANGE",
          configuration: {
            min: 0,
            max: 300
          }
        }
      ]
    },
    {
      fieldId: "temp",
      validators: [
        {
          type: "RANGE",
          configuration: {
            min: 0,
            max: 120
          }
        }
      ]
    }
  ];
}

/**
 * Returns the signature workflow for the MAR form
 */
function getMarSignatureWorkflow(): SignatureWorkflow {
  return {
    steps: [
      {
        type: "PREP",
        required: true,
        conditions: [
          {
            field: "showMARPrepSig",
            operator: ConditionOperatorEnum.EQUALS,
            value: "true"
          }
        ]
      },
      {
        type: "ADMIN",
        required: true
      },
      {
        type: "EFFECTIVENESS",
        required: false,
        conditions: [
          {
            field: "medicationType",
            operator: ConditionOperatorEnum.EQUALS,
            value: "PRN"
          }
        ]
      }
    ]
  };
}

/**
 * Returns a test schema with a bad condition
 */
export function getBadConditionSchema(): FormSchema {
  const rtn = {
    name: "Bad Condition Form",
    multiEntry: true,
    fields: [],
    rules: [
      {
        ruleId: "badRule1",
        description: "This is a bad rule that has a condition without declared field",
        conditions: [
          {
            operator: ConditionGroupOperatorEnum.AND,
            conditions: [
              {
                field: "abc",
                operator: ConditionOperatorEnum.EQUALS,
                value: ""
              }
            ]
          }
        ],
        action: []
      }
    ]
  };
  validateSchema(rtn);
  return rtn;
}

/**
 * Returns a test schema with a bad action
 */
export function getBadActionSchema(): FormSchema {
  const rtn = {
    name: "Bad Action Form",
    multiEntry: true,
    fields: [],
    rules: [
      {
        ruleId: "badRule1",
        description: "This is a bad rule that has a condition without declared field",
        conditions: [],
        action: [
          {
            action: RuleActionEnum.REQUIRE,
            field: "abc"
          }
        ]
      }
    ]
  };
  validateSchema(rtn);
  return rtn;
}