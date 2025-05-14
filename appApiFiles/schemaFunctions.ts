/// <reference path="../../../scriptlibrary" />

import { getMarSchema as getMarSchemaImpl } from './schemas/marschema'


/**
 * Returns a schema for the MAR form
 */
export function getMarSchema() {
  return getMarSchemaImpl();
}

/**
 * Returns a test schema with a bad condition
 */
export function getBadConditionSchema() {
  // const rtn = {
  //   name: "Bad Condition Form",
  //   multiEntry: true,
  //   fields: [],
  //   rules: [
  //     {
  //       ruleId: "badRule1",
  //       description: "This is a bad rule that has a condition without declared field",
  //       conditions: [
  //         {
  //           operator: ConditionGroupOperatorEnum.AND,
  //           conditions: [
  //             {
  //               field: "abc",
  //               operator: ConditionOperatorEnum.EQUALS,
  //               value: ""
  //             }
  //           ]
  //         }
  //       ],
  //       action: []
  //     }
  //   ]
  // };
  // validateSchema(rtn);
  // return rtn;
}

/**
 * Returns a test schema with a bad action
 */
export function getBadActionSchema() {
  // const rtn = {
  //   name: "Bad Action Form",
  //   multiEntry: true,
  //   fields: [],
  //   rules: [
  //     {
  //       ruleId: "badRule1",
  //       description: "This is a bad rule that has a condition without declared field",
  //       conditions: [],
  //       action: [
  //         {
  //           action: RuleActionEnum.REQUIRE,
  //           field: "abc"
  //         }
  //       ]
  //     }
  //   ]
  // };
  // validateSchema(rtn);
  // return rtn;
}