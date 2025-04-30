# BlueStep Context for AI Models

## 1. Introduction

BlueStep is a Software-as-a-Service (SaaS) application built on a Java platform. Its primary purpose is to allow business users to define custom data structures (Forms, Fields) and associated workflows without traditional programming.

## 2. Core Data Hierarchy

BlueStep organizes data hierarchically. Understanding these relationships is key:

*   **Record:**
    *   The central data entity in BlueStep, analogous to a master object or record instance.
    *   Uniquely identified by its **Record Type** and **Record Category**.
    *   Acts as a container for related **Entries**.
    *   The specific Forms applicable to a Record are determined by its Type/Category combination and the "Relate" configuration.

*   **Record Type:**
    *   A broad classification for Records (e.g., `Individual`, `Facility`, `Organization`).
    *   Each Record Type has a special, defining Form called the "Record Type Form".

*   **Record Category:**
    *   A more specific sub-classification applied to one or more **Record Types** (e.g., `Active Client`, `Inactive Client`, `Main Facility`, `Satellite Facility`).
    *   Helps determine which **Forms** (beyond the Record Type Form) apply to a **Record**.

*   **Form:**
    *   A collection of related **Fields**, analogous to a database table.
    *   Applied to specific **Record Types** or **Record Categories**.
    *   Can be configured as:
        *   **Single-Entry:** Only one instance of this Form can exist per Record.
        *   **Multi-Entry:** Multiple instances (Entries) of this Form can exist per Record.

*   **Field:**
    *   An individual data point within a **Form**, analogous to a database column.
    *   Has a defined data type (Text, Number, Date, Lookup, etc.) and specific configuration (validation, required, visibility).

*   **Entry:**
    *   A specific instance of a **Form** associated with a **Record**, analogous to a database row.
    *   Contains the actual data values for the **Fields** defined in that Form.

## 3. Configuration ("Relate")

"Relate" is the administrative section of BlueStep where configuration occurs. Key components configured here include:

*   Record Types
*   Record Categories
*   Forms
*   Fields
*   Option Lists (for dropdowns/lookups)
*   Queries
*   Reports
*   Formulas (for calculated fields)
*   Merge Reports (custom layouts)
*   End Points (for integrations)

## 4. Data Retrieval and Presentation

*   **Queries & Reports:**
    *   Used for searching, retrieving, and displaying data based on specified criteria.
    *   Configured based on **Record Types** and **Record Categories**.
    *   Search criteria are defined using **Fields** from applicable **Forms**.
    *   Results display selected **Fields**.
    *   **Important:** Each row/result represents a single **Record** and one specific **Entry** for each included Form (even if the Form is multi-entry, the query targets *one* specific entry based on criteria or defaults).

*   **Layouts & Rendering:**
    *   Define how **Entries** (Form data) are displayed and edited on a **Record**.
    *   **Generic Layout:** The standard, configuration-driven method. Allows setting properties like:
        *   Required fields
        *   Conditional visibility (e.g., "Show Field B if Field C equals 1")
        *   Validation rules (e.g., max length, numeric range).
    *   **Merge Report:** Used when the Generic Layout is insufficient. Allows creating custom HTML/CSS/JavaScript interfaces.
        *   **RelateScript:** An older, proprietary scripting language (loosely resembles JavaScript).
        *   **bsjs:** The newer method, allowing **TypeScript** code. This code is compiled to JavaScript and executed server-side via the GraalVM Java library.
    *   **Merge Tag:** The core mechanism for rendering an editable **Field** within *any* layout (Generic or Merge Report). It references a specific field within a form's entry (e.g., `[FormName.FieldName]`). The tag belongs to an **Entry**, which belongs to a **Form**, which is associated with a **Record**.
*   

## NEW
## Scripts

*   **Formulas:**
    *   Formulas are used to manipulate data. There are 3 primary types. Scheduled Formulas, On Demand Formulas, and Formulas that are triggered by an action (Pre-Edit, Pre-Save, Post-Save, Pre-Delete).
        *   Scheduled Formulas are configured to run on a schedule. They have a similar configuraiton to Queries and Reports where you define a Record Type and Categories you want it to run on. Under the hood it creates a temporary query and executes the formula for each result.
        *   On Demand Formulas are primarily used for Async functions. They are triggered from other Formulas and End Points.
        *   Action Formulas are used to make changes to data as it's being used.
            *   Pre-Edit formulas run before a specific entry is presented to the user. It can do default values and other pre-calculations.
            *   Pre-Save formulas run in between a user pressing the save button and the data actually being saved. This can be used to perform validations on the data being saved.
            *   Post-Save formulas run after a user has pressed the save button and the data has actually been saved. This can be used to perform additional calculations and manipulate other pieces of data. This is the most common type of formula.
            *   Pre-Delete formulas run inbetween an entry requesting deletion and the deletion actually happening. This allows for validation to stop or allow the delete to happen.
*   **Merge Reports**
    *   Merge Reports are used to display data. They have multiple contexts they can run within.
        *   Pagelet Merge Report: These Merge Reports can be added to most BlueStep pages. They are primarily used to add JavaScript onto the page.
        *   Record Nav Merge Reports: These Merge Reports are added to a Records Navigation in addition to the visible forms. It can be used to "merge" data together and make charts, reports etc...
        *   Entry Layout Merge Reports: These Merge Reports will completely replace the layout of an entry being shown.
        *   Field Merge Reports: These Merge Reports are used to mix Generic Layout with flexibility of Merge Reports. They can be used to add Javascript to a Generic Layout entry.
*   **End Points**
    *   End Points are similar to Formulas, but they are triggered by an HTTP request. Their configuration is similar to an API. A path, HTTP Methods, IP White/Blacklist, and Permissions are configured. These can be used to create custom BlueStep APIs. They also are another way to trigger aysnc behavior, similar to an On-Demand Formula.

## 5. Key Relationships Summary

```mermaid
graph TD
    subgraph Data Hierarchy
        A[Record (Type + Category)] --> B(Entry);
        B --> C{Form};
        C --> D[Field];
    end

    subgraph Configuration & Application
        C -- Applied to --> A;
        Relate(Relate Configuration) -- Defines --> A;
        Relate -- Defines --> C;
        Relate -- Defines --> D;
        Relate -- Defines --> E[Query/Report];
        Relate -- Defines --> F[Layout (Generic/Merge Report)];
    end

    subgraph Usage
        E -- Retrieves --> A;
        F -- Displays/Edits --> B;
        F -- Uses Merge Tag for --> D;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#cfc,stroke:#333,stroke-width:2px
```

## 6. Example Scenario

This example illustrates the concepts:

#### Record Types
*   `Person` <!-- Record Type -->
*   `Building` <!-- Record Type -->

#### Record Categories
*   `Young Person` <!-- Category applied to Person Type -->
*   `Old Person` <!-- Category applied to Person Type -->

#### Forms & Fields

*   **Personal Information Form** <!-- Record Type Form for 'Person' -->
    *   **Configuration:** Single-Entry
    *   **Fields:** Name (Text), DOB (Date), City (Text), State (Lookup), Zip (Number), Phone (Text)

*   **School Information Form**
    *   **Configuration:** Applies only to `Young Person` Category, Single-Entry
    *   **Fields:** School Name (Text)

*   **Work Information Form**
    *   **Configuration:** Applies only to `Old Person` Category, Single-Entry
    *   **Fields:** Company Name (Text), Company Size (Number)

*   **Building Information Form** <!-- Record Type Form for 'Building' -->
    *   **Configuration:** Single-Entry
    *   **Fields:** Building Name (Text), Building Capacity (Number)

*   **Maintenance History Form**
    *   **Configuration:** Applies to `Building` Type, Multi-Entry
    *   **Fields:** Date (DateTime), Task (Text), Completed By (Signature)

**Explanation:**

*   A `Record` with Type=`Person` and Category=`Young Person` would have the `Personal Information` Form and the `School Information` Form applicable.
*   A `Record` with Type=`Person` and Category=`Old Person` would have the `Personal Information` Form and the `Work Information` Form applicable.
*   A `Record` with Type=`Building` (regardless of Category, unless specific Building categories were defined and used in Form config) would have the `Building Information` Form and potentially multiple `Entries` of the `Maintenance History` Form.
*   


## NEW
* Links to documentation
  * Main Platform Support
    * https://bluestepplatformsupport.bluestep.net/shared/layouts/singleblock.jsp?_event=view&_id=120130___194606
  * Relatescript Support Home
    * https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3121
  * Relatescript Table of Contents
    * This is where a lot of how RelateScript works is defined.
    * https://bluestepplatformsupport.bluestep.net/shared/custompage/contentoutline.jsp?_event=view&_id=445506___3121
  * bsjs Documentation
    * This is the syntax for bsjs
    * https://bluestepplatformsupport.bluestep.net/jslib/docs/B/
  * Relate Components Home
    * https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8181
  * Compund Form Problem
    * This describes forms that edit forms that edit other forms
    * https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8822
  * 8 Step Edit Process
    * This explains in what order formulas execute
    * https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3842
  * General BlueStep Support
    * The hub for different BlueStep "products". This is a good place to review how BlueStep is commonly configured and sold to clients.
    * https://support.bluestep.net/home.jsp


## NEW
### TODO
* Record Navigation
* Unit Structure
* Permissions
* Site Structure
* Site Components
* Custom Queries
* Script Examples with descriptions
* Script Imports
* Add "entry" data to example
* Add "script" scenarios to example
* Field Type Descriptions
* Description for all relate types
* Container Tree Example
* GraphQL Documentation?
