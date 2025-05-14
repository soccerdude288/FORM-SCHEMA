/// <reference path="../../../scriptlibrary" />

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