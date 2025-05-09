# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains schema definitions for a Medication Administration Record (MAR) system and related healthcare forms. The primary purpose is to translate BlueStep-configured forms into a JSON schema representation that can be consumed by external applications.

The project implements a comprehensive rule-based system for defining form behavior, validation logic, and business rules for medication administration workflows.

## Key Components

1. **Schema System** - The core of the project is the schema definition system in:
   - `MAR-Schema/enhancedrules.ts` - Enhanced rule system with specialized actions
   - `MAR-Schema/schemafunctions.ts` - Original schema implementation with rule processors

2. **API Layer** - The TypeScript application that serves schema data:
   - `app-ts/app.ts` - REST API endpoints that expose schema and data functionality

3. **BlueStep Integration** - Files that connect with the BlueStep system:
   - `MAR-Schema/conditionalrequired.bluestep` - BlueStep script for rule enforcement
   - `MAR-Schema/mardetail.bluestep` - Main layout and business logic
   - `MAR-Schema/marformgraphqlresults.json` - Field configurations
   - `MAR-Schema/graphqlformquery.gql` - GraphQL query for form metadata

## Schema Architecture

The schema system is built on a hierarchical structure:

1. **FormSchema** - Top-level container for form definitions
2. **Fields** - Definitions of data elements (inputs, selects, etc.)
3. **Rules** - Business logic for visibility, requirements, validation
4. **Actions** - Operations that occur when rule conditions are met

The enhanced rule system (`enhancedrules.ts`) extends the original schema with:
- Rule categorization (visibility, validation, medication, etc.)
- Specialized configurations for different rule types
- Action-specific parameters for complex business logic

## Development 

### Running TypeScript Files

The TypeScript files are compiled and executed within the BlueStep environment. There are no local build commands for this project.

To work with TypeScript files:

1. Edit the `.ts` files directly
2. For testing, you can use BlueStep's script editor or rely on static analysis

### Testing Schema Validation

The schema system includes validation functions that check for:
- Field references that match declared fields
- Unique rule and field IDs
- Valid action types for targeted fields

To test schema validation:
- Use the `validateSchema()` function in `schemafunctions.ts`
- There are test schemas like `getBadConditionSchema()` and `getBadActionSchema()`

## Working with Schema Files

When modifying the schema system:

1. Use the existing type definitions as a guide
2. Maintain the rule-based architecture for business logic
3. Ensure all field references are properly declared
4. Follow the enhanced rule format for new business rules
5. Test validation with sample data

## Schema Rule Types

The system supports several rule types:

- **VISIBILITY** - Control field visibility
- **REQUIREMENT** - Make fields required conditionally
- **VALIDATION** - Validate field values
- **SIGNATURE** - Handle signature collection workflow
- **MEDICATION** - Medication-specific rules
- **CALCULATION** - Calculate values based on other inputs

## Actions and Specialized Configurations

Complex business logic is implemented through specialized action configurations:

- **VALIDATE** - Range, regex, and custom validation
- **COLLECT_SIGNATURE** - Signature workflows with witness requirements
- **ENFORCE_INTERVAL** - Time restrictions between doses
- **REQUIRE_VITALS** - Dynamic vital sign requirements
- **CALCULATE_DOSE** - Sliding scale calculations for medications

## Project Notes

This project is primarily focused on schema definition and implementation. It serves as a bridge between the BlueStep platform and external applications that need to understand form structure and business rules.

The schema system is designed to be extensible, allowing for new rule types and actions to be added without changing the core architecture.