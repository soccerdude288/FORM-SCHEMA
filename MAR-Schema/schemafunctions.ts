/// <reference path="../../../scriptlibrary" />

interface FormSchema {
    name: string,
    multiEntry: boolean,
    fields: Array<Field>,
    rules: Array<Rule>,
    dynamicRequirements?: Array<DynamicFieldRequirement>,
    medicationRules?: Array<MedicationRule>,
    validationRules?: Array<ValidationRule>,
    signatureWorkflow?: SignatureWorkflow
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
    UNEDITABLE = "UNEDITABLE"
  }
  
  interface Field {
    name: string,
    fieldId: string,
    editable: boolean,
    fieldType: FieldTypeEnum
    // permissions ??
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
  
  interface Rule {
    ruleId: string,
    description: string,
    conditions: Array<RuleConditionGroups>,
    action: Array<RuleAction>,
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
  
  interface RuleAction {
    field: string,
    action: RuleActionEnum
  }
  
  // New interfaces for enhanced functionality
  interface DynamicFieldRequirement {
    fieldId: string;
    requiredWhen: Array<{
      field: string;
      operator: ConditionOperatorEnum;
      value: string | GenericRuleValue;
    }>;
  }
  
  interface MedicationRule {
    medicationType: string;
    rules: Array<{
      type: 'PRN_INTERVAL' | 'PAIN_TRACKING' | 'VITALS_REQUIRED' | 'GLUCOSE_SCALE';
      configuration: any;
    }>;
  }
  
  interface ValidationRule {
    fieldId: string;
    validators: Array<{
      type: 'RANGE' | 'REGEX' | 'CUSTOM';
      configuration: any;
    }>;
  }
  
  interface SignatureWorkflow {
    steps: Array<{
      type: 'PREP' | 'ADMIN' | 'EFFECTIVENESS';
      required: boolean;
      conditions?: Array<RuleCondition>;
    }>;
  }
  
  // Business Rule Processor
  interface RuleProcessor {
    processDynamicRequirements(schema: FormSchema, formData: any): Array<{fieldId: string, required: boolean}>;
    processMedicationRules(schema: FormSchema, formData: any): Array<{type: string, message: string}>;
    processValidationRules(schema: FormSchema, formData: any): Array<{fieldId: string, valid: boolean, message: string}>;
    processSignatureWorkflow(schema: FormSchema, formData: any): Array<{type: string, required: boolean, message: string}>;
  }
  
  class MarRuleProcessor implements RuleProcessor {
    processDynamicRequirements(schema: FormSchema, formData: any): Array<{fieldId: string, required: boolean}> {
      const requirements: Array<{fieldId: string, required: boolean}> = [];
      
      if (!schema.dynamicRequirements) return requirements;

      schema.dynamicRequirements.forEach(req => {
        const isRequired = req.requiredWhen.some(condition => {
          const fieldValue = formData[condition.field];
          switch (condition.operator) {
            case ConditionOperatorEnum.EQUALS:
              return fieldValue === condition.value;
            case ConditionOperatorEnum.NOT_EQUALS:
              return fieldValue !== condition.value;
            case ConditionOperatorEnum.CONTAINS:
              return Array.isArray(fieldValue) ? fieldValue.includes(condition.value) : false;
            default:
              return false;
          }
        });

        requirements.push({ fieldId: req.fieldId, required: isRequired });
      });

      return requirements;
    }

    processMedicationRules(schema: FormSchema, formData: any): Array<{type: string, message: string}> {
      const messages: Array<{type: string, message: string}> = [];
      
      if (!schema.medicationRules) return messages;

      const medicationType = formData.medicationType;
      const rules = schema.medicationRules.find(r => r.medicationType === medicationType);

      if (!rules) return messages;

      rules.rules.forEach(rule => {
        switch (rule.type) {
          case 'PRN_INTERVAL':
            if (formData.lastAdminTime) {
              const lastAdmin = new Date(formData.lastAdminTime);
              const now = new Date();
              const hoursSinceLastAdmin = (now.getTime() - lastAdmin.getTime()) / (1000 * 60 * 60);
              
              if (hoursSinceLastAdmin < rule.configuration.minInterval) {
                messages.push({
                  type: 'PRN_INTERVAL',
                  message: `Cannot administer PRN medication. Minimum interval of ${rule.configuration.minInterval} hours not met.`
                });
              }
            }
            break;

          case 'PAIN_TRACKING':
            if (!formData.prePain && rule.configuration.prePainRequired) {
              messages.push({
                type: 'PAIN_TRACKING',
                message: 'Pre-administration pain level is required.'
              });
            }
            if (!formData.postPain && rule.configuration.postPainRequired) {
              messages.push({
                type: 'PAIN_TRACKING',
                message: 'Post-administration pain level is required.'
              });
            }
            break;

          case 'GLUCOSE_SCALE':
            if (!formData.glucose && rule.configuration.glucoseRequired) {
              messages.push({
                type: 'GLUCOSE_SCALE',
                message: 'Glucose level is required for insulin administration.'
              });
            }
            break;
        }
      });

      return messages;
    }

    processValidationRules(schema: FormSchema, formData: any): Array<{fieldId: string, valid: boolean, message: string}> {
      const validations: Array<{fieldId: string, valid: boolean, message: string}> = [];
      
      if (!schema.validationRules) return validations;

      schema.validationRules.forEach(rule => {
        const value = formData[rule.fieldId];
        
        rule.validators.forEach(validator => {
          let isValid = true;
          let message = '';

          switch (validator.type) {
            case 'RANGE':
              if (value < validator.configuration.min || value > validator.configuration.max) {
                isValid = false;
                message = `Value must be between ${validator.configuration.min} and ${validator.configuration.max}`;
              }
              break;
            case 'REGEX':
              if (!new RegExp(validator.configuration.pattern).test(value)) {
                isValid = false;
                message = validator.configuration.message || 'Invalid format';
              }
              break;
            case 'CUSTOM':
              // Custom validation logic would go here
              break;
          }

          validations.push({ fieldId: rule.fieldId, valid: isValid, message });
        });
      });

      return validations;
    }

    processSignatureWorkflow(schema: FormSchema, formData: any): Array<{type: string, required: boolean, message: string}> {
      const requirements: Array<{type: string, required: boolean, message: string}> = [];
      
      if (!schema.signatureWorkflow) return requirements;

      schema.signatureWorkflow.steps.forEach(step => {
        let isRequired = step.required;
        
        if (step.conditions) {
          isRequired = step.conditions.every(condition => {
            const fieldValue = formData[condition.field];
            switch (condition.operator) {
              case ConditionOperatorEnum.EQUALS:
                return fieldValue === condition.value;
              case ConditionOperatorEnum.NOT_EQUALS:
                return fieldValue !== condition.value;
              default:
                return false;
            }
          });
        }

        if (isRequired && !formData[`${step.type.toLowerCase()}Signature`]) {
          requirements.push({
            type: step.type,
            required: true,
            message: `${step.type} signature is required`
          });
        }
      });

      return requirements;
    }
  }
  
  // Export the rule processor
  export const marRuleProcessor = new MarRuleProcessor();
  
  export function getMarSchema():FormSchema {
    let rtn:FormSchema = {
      name: "MAR",
      multiEntry: true,
      fields: getMarFields(),
      rules: getMarRules(),
      dynamicRequirements: getMarDynamicRequirements(),
      medicationRules: getMarMedicationRules(),
      validationRules: getMarValidationRules(),
      signatureWorkflow: getMarSignatureWorkflow()
    };
  
    validateSchema(rtn);
    return rtn;
  }
  
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
  
    return Array.of(
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
    );
  }
  
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
  
    return Array.of(
      exceptionRequiresNotesRule,
      painMedRequiresPainLevelRule,
      administeredRequiresSignatureRule,
      prnRequiresEffectivenessRule
    );
  }
  
  export function getBadConditionSchema():FormSchema {
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
    }
    validateSchema(rtn);
    return rtn;
  }
  
  export function getBadActionSchema():FormSchema {
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
    }
    validateSchema(rtn);
    return rtn;
  }
  
  function validateSchema(schema: FormSchema) {
    const declaredFieldIds = schema.fields.flatMap(f => f.fieldId);
    schema.rules.forEach(rule => {
      const conditionFieldIds = rule.conditions.flatMap(conditions => conditions.conditions.flatMap(c => c.field));
      const conditionFieldIdsThatAreNotDeclared = findExtraValues(declaredFieldIds, conditionFieldIds);
      if (conditionFieldIdsThatAreNotDeclared.length > 0) {
        console.error(`Schema ${schema.name} has condition field references that are not defined. ${conditionFieldIdsThatAreNotDeclared.join(", ")}`);
        throw "Form Schema Validation Error: Undefined Condition Fields";
      }
      const actionFieldIds = rule.action.flatMap(a => a.field);
      const actionFieldIdsThatAreNotDeclared = findExtraValues(declaredFieldIds, actionFieldIds);
      if (actionFieldIdsThatAreNotDeclared.length > 0) {
        console.error(`Schema ${schema.name} has action field references that are not defined. ${conditionFieldIdsThatAreNotDeclared.join(", ")}`);
        throw "Form Schema Validation Error: Undefined Action Fields";
      }
    });
  }
  
  function findExtraValues(A:Array<string>, B:Array<string>):Array<string> {
      return B.filter(value => !A.includes(value));
  }
  
  // New functions for enhanced functionality
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