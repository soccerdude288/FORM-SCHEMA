/// <reference path="../../../scriptlibrary" />

/**
 * Schema Framework
 * 
 * This file contains the core interfaces, enums, and classes for the schema system.
 * It defines the structure for forms, fields, rules, and rule processing.
 */

// -------------------------
// Core Enums
// -------------------------

/**
 * Field type enumeration defining the types of fields supported in the system
 */
export enum FieldTypeEnum {
  TEXT = "TEXT",
  MEMO = "MEMO",
  NUMBER = "NUMBER",
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  SIGNATURE = "SIGNATURE"
}

/**
 * Condition group operators for combining multiple conditions
 */
export enum ConditionGroupOperatorEnum {
  OR = "OR",
  AND = "AND"
}

/**
 * Condition operators for individual conditions
 */
export enum ConditionOperatorEnum {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  CONTAINS = "CONTAINS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN"
}

/**
 * Special rule values
 */
export enum GenericRuleValue {
  ANY = "ANY"
}

/**
 * Rule action types
 */
export enum RuleActionEnum {
  HIDE = "HIDE",
  SHOW = "SHOW",
  REQUIRE = "REQUIRE",
  UNREQUIRE = "UNREQUIRE",
  EDITABLE = "EDITABLE",
  UNEDITABLE = "UNEDITABLE"
}

// -------------------------
// Field Interfaces
// -------------------------

/**
 * Base field interface
 */
export interface Field {
  name: string;
  fieldId: string;
  editable: boolean;
  fieldType: FieldTypeEnum;
}

/**
 * Editable field interface extending the base field
 */
export interface EditableField extends Field {
  required: boolean;
  defaultValue?: string;
}

/**
 * Select field interface for dropdowns and multi-selects
 */
export interface SelectField extends EditableField {
  options: Array<FieldOptions>;
}

/**
 * Number field interface with min/max constraints
 */
export interface NumberField extends EditableField {
  min: number;
  max: number;
}

/**
 * Text field interface with optional regex validation
 */
export interface TextField extends EditableField {
  regex?: string;
}

/**
 * Option for select fields
 */
export interface FieldOptions {
  name: string;
  exportValue: string;
}

// -------------------------
// Rule Interfaces
// -------------------------

/**
 * Rule interface defining conditions and actions
 */
export interface Rule {
  ruleId: string;
  description: string;
  conditions: Array<RuleConditionGroups>;
  action: Array<RuleAction>;
}

/**
 * Rule condition groups for complex condition logic
 */
export interface RuleConditionGroups {
  operator: ConditionGroupOperatorEnum;
  conditions: Array<RuleCondition>;
}

/**
 * Individual rule condition
 */
export interface RuleCondition {
  field: string;
  operator: ConditionOperatorEnum;
  value: string | GenericRuleValue;
}

/**
 * Rule action to be applied when conditions are met
 */
export interface RuleAction {
  field: string;
  action: RuleActionEnum;
}

// -------------------------
// Enhanced Functionality Interfaces
// -------------------------

/**
 * Dynamic field requirement based on conditions
 */
export interface DynamicFieldRequirement {
  fieldId: string;
  requiredWhen: Array<{
    field: string;
    operator: ConditionOperatorEnum;
    value: string | GenericRuleValue;
  }>;
}

/**
 * Medication-specific rules
 */
export interface MedicationRule {
  medicationType: string;
  rules: Array<{
    type: 'PRN_INTERVAL' | 'PAIN_TRACKING' | 'VITALS_REQUIRED' | 'GLUCOSE_SCALE';
    configuration: any;
  }>;
}

/**
 * Field validation rules
 */
export interface ValidationRule {
  fieldId: string;
  validators: Array<{
    type: 'RANGE' | 'REGEX' | 'CUSTOM';
    configuration: any;
  }>;
}

/**
 * Signature workflow steps
 */
export interface SignatureWorkflow {
  steps: Array<{
    type: 'PREP' | 'ADMIN' | 'EFFECTIVENESS';
    required: boolean;
    conditions?: Array<RuleCondition>;
  }>;
}

/**
 * Dynamic rule source for rules defined in related records
 */
export interface DynamicRuleSource {
  sourceField: string;      // The field containing the source data (e.g., "adminExRel")
  ruleType: 'REQUIREMENT' | 'VALIDATION' | 'VISIBILITY';
  fieldMapping: {           // Maps fields in the source record to rule attributes
    requiredField?: string; // Field indicating if target field is required (e.g., "noteReq")
    visibilityField?: string; // Field indicating if target field is visible
    validationField?: string; // Field containing validation logic
  };
  targetField: string;      // The field this rule applies to (e.g., "notes")
  sourceType?: 'SINGLE' | 'MULTI'; // Whether the source field is single-valued or multi-valued
  description?: string;     // Optional description of the rule source
}

/**
 * Complete form schema interface
 */
export interface FormSchema {
  name: string;
  multiEntry: boolean;
  fields: Array<Field>;
  rules: Array<Rule>;
  dynamicRequirements?: Array<DynamicFieldRequirement>;
  medicationRules?: Array<MedicationRule>;
  validationRules?: Array<ValidationRule>;
  signatureWorkflow?: SignatureWorkflow;
  dynamicRuleSources?: Array<DynamicRuleSource>;
}

// -------------------------
// Rule Processor Interface and Base Implementation
// -------------------------

/**
 * Rule processor interface for handling different types of rules
 */
export interface RuleProcessor {
  processDynamicRequirements(schema: FormSchema, formData: any): Array<{fieldId: string, required: boolean}>;
  processMedicationRules(schema: FormSchema, formData: any): Array<{type: string, message: string}>;
  processValidationRules(schema: FormSchema, formData: any): Array<{fieldId: string, valid: boolean, message: string}>;
  processSignatureWorkflow(schema: FormSchema, formData: any): Array<{type: string, required: boolean, message: string}>;
  processDynamicRuleSources(schema: FormSchema, formData: any): Array<Rule>;
  getAllRules(schema: FormSchema, formData: any): Array<Rule>;
}

/**
 * Base rule processor implementation with common functionality
 */
export class BaseRuleProcessor implements RuleProcessor {
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

  /**
   * Process dynamic rule sources to generate rules based on related record data
   * @param schema The form schema containing dynamic rule sources
   * @param formData The current form data, including related records
   * @returns An array of generated rules based on dynamic sources
   */
  processDynamicRuleSources(schema: FormSchema, formData: any): Array<Rule> {
    const generatedRules: Array<Rule> = [];
    
    if (!schema.dynamicRuleSources) return generatedRules;

    schema.dynamicRuleSources.forEach(source => {
      // Get the source field value (e.g., the adminExRel value)
      const sourceValue = formData[source.sourceField];
      
      if (!sourceValue) return;
      
      // Handle different types of relationships based on sourceType
      const sourceType = source.sourceType || 'SINGLE';
      const sourceEntries = sourceType === 'MULTI' || Array.isArray(sourceValue)
        ? (Array.isArray(sourceValue) ? sourceValue : [sourceValue])
        : [sourceValue];
      
      // Generate a unique rule ID prefix for this source
      const ruleIdPrefix = `dynamic_${source.sourceField}_${source.targetField}`;
      
      // Process each source entry to generate rules
      sourceEntries.forEach((entry, index) => {
        // Skip if the entry doesn't have the mapped field or fields property
        if (!entry || !entry.fields) return;
        
        // Generate rules based on the rule type
        if (source.ruleType === 'REQUIREMENT' && source.fieldMapping.requiredField) {
          // For requirement rules, check if the requirement field is true
          const fieldName = source.fieldMapping.requiredField;
          const isRequired = entry.fields[fieldName] &&
                            (typeof entry.fields[fieldName].val === 'function') &&
                            entry.fields[fieldName].val();
          
          if (isRequired) {
            // Create a rule that requires the target field when this entry is selected
            generatedRules.push({
              ruleId: `${ruleIdPrefix}_required_${index}`,
              description: source.description || `Dynamic requirement for ${source.targetField} from ${source.sourceField}`,
              conditions: [
                {
                  operator: ConditionGroupOperatorEnum.AND,
                  conditions: [
                    {
                      field: source.sourceField,
                      operator: ConditionOperatorEnum.EQUALS,
                      value: entry.id().shortId()
                    }
                  ]
                }
              ],
              action: [
                {
                  action: RuleActionEnum.REQUIRE,
                  field: source.targetField
                }
              ]
            });
          }
        }
        
        // Handle visibility rules
        if (source.ruleType === 'VISIBILITY' && source.fieldMapping.visibilityField) {
          const fieldName = source.fieldMapping.visibilityField;
          const isVisible = entry.fields[fieldName] &&
                           (typeof entry.fields[fieldName].val === 'function') &&
                           entry.fields[fieldName].val();
          
          if (isVisible) {
            generatedRules.push({
              ruleId: `${ruleIdPrefix}_visibility_${index}`,
              description: source.description || `Dynamic visibility for ${source.targetField} from ${source.sourceField}`,
              conditions: [
                {
                  operator: ConditionGroupOperatorEnum.AND,
                  conditions: [
                    {
                      field: source.sourceField,
                      operator: ConditionOperatorEnum.EQUALS,
                      value: entry.id().shortId()
                    }
                  ]
                }
              ],
              action: [
                {
                  action: RuleActionEnum.SHOW,
                  field: source.targetField
                }
              ]
            });
          } else {
            generatedRules.push({
              ruleId: `${ruleIdPrefix}_invisibility_${index}`,
              description: source.description || `Dynamic invisibility for ${source.targetField} from ${source.sourceField}`,
              conditions: [
                {
                  operator: ConditionGroupOperatorEnum.AND,
                  conditions: [
                    {
                      field: source.sourceField,
                      operator: ConditionOperatorEnum.EQUALS,
                      value: entry.id().shortId()
                    }
                  ]
                }
              ],
              action: [
                {
                  action: RuleActionEnum.HIDE,
                  field: source.targetField
                }
              ]
            });
          }
        }
        
        // Additional rule types can be added here
      });
    });
    
    return generatedRules;
  }

  /**
   * Get all rules for the schema, including both static and dynamically generated rules
   * @param schema The form schema
   * @param formData The current form data
   * @returns Combined array of static and dynamic rules
   */
  getAllRules(schema: FormSchema, formData: any): Array<Rule> {
    // Start with the static rules from the schema
    const allRules = [...(schema.rules || [])];
    
    // Add dynamically generated rules if dynamic rule sources are present
    if (schema.dynamicRuleSources && schema.dynamicRuleSources.length > 0) {
      const dynamicRules = this.processDynamicRuleSources(schema, formData);
      allRules.push(...dynamicRules);
    }
    
    return allRules;
  }
}

// -------------------------
// Utility Functions
// -------------------------

/**
 * Validates a schema for integrity
 * @param schema The schema to validate
 */
export function validateSchema(schema: FormSchema): void {
  const declaredFieldIds = schema.fields.flatMap(f => f.fieldId);
  
  // Validate static rules
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
  
  // Validate dynamic rule sources
  if (schema.dynamicRuleSources) {
    schema.dynamicRuleSources.forEach(source => {
      // Validate that sourceField exists in the schema
      if (!declaredFieldIds.includes(source.sourceField)) {
        console.error(`Dynamic rule source references undefined source field: ${source.sourceField}`);
        throw "Form Schema Validation Error: Undefined Dynamic Rule Source Field";
      }
      
      // Validate that targetField exists in the schema
      if (!declaredFieldIds.includes(source.targetField)) {
        console.error(`Dynamic rule source references undefined target field: ${source.targetField}`);
        throw "Form Schema Validation Error: Undefined Dynamic Rule Target Field";
      }
      
      // Validate that rule type is valid
      const validRuleTypes = ['REQUIREMENT', 'VALIDATION', 'VISIBILITY'];
      if (!validRuleTypes.includes(source.ruleType)) {
        console.error(`Invalid rule type in dynamic rule source: ${source.ruleType}`);
        throw "Form Schema Validation Error: Invalid Dynamic Rule Type";
      }
      
      // Validate that appropriate field mappings exist based on rule type
      if (source.ruleType === 'REQUIREMENT' && !source.fieldMapping.requiredField) {
        console.error(`Dynamic rule source of type REQUIREMENT must specify requiredField in fieldMapping`);
        throw "Form Schema Validation Error: Missing Required Field Mapping";
      }
      
      if (source.ruleType === 'VISIBILITY' && !source.fieldMapping.visibilityField) {
        console.error(`Dynamic rule source of type VISIBILITY must specify visibilityField in fieldMapping`);
        throw "Form Schema Validation Error: Missing Visibility Field Mapping";
      }
      
      if (source.ruleType === 'VALIDATION' && !source.fieldMapping.validationField) {
        console.error(`Dynamic rule source of type VALIDATION must specify validationField in fieldMapping`);
        throw "Form Schema Validation Error: Missing Validation Field Mapping";
      }
    });
  }
}

/**
 * Helper function to find values in B that are not in A
 */
export function findExtraValues(A: Array<string>, B: Array<string>): Array<string> {
  return B.filter(value => !A.includes(value));
}