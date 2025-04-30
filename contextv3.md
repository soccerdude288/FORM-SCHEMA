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
    *   They are accessed by script via an optional `formulaId` in RelateScript or `FID` Alt Id (also known as Custom Lookup Property)
    *   They have a `styleClass` property that adds an HTML class to the rendered field on the FE. This allows for custom Javascript Behavior.

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
    *   **Merge Report:** Used when the Generic Layout is insufficient. Allows creating custom HTML/CSS/JavaScript interfaces. Can run in multiple contexts (see Section 5).
        *   **RelateScript:** An older, proprietary scripting language (loosely resembles JavaScript).
        *   **bsjs:** The newer method, allowing **TypeScript** code. This code is compiled to JavaScript and executed server-side via the GraalVM Java library.
    *   **Merge Tag:** The core mechanism for rendering an editable **Field** within *any* layout (Generic or Merge Report). It references a specific field within a form's entry (e.g., `[FormName.FieldName]`). The tag belongs to an **Entry**, which belongs to a **Form**, which is associated with a **Record**.

## 5. Automation, Customization, and Integration (Scripts & Endpoints)

BlueStep provides several mechanisms for automating processes, customizing displays beyond Generic Layouts, and integrating with external systems.

*   **Formulas:**
    *   Used to manipulate data based on triggers or schedules. There are 3 primary types:
        *   **Scheduled Formulas:** Run automatically on a defined schedule. Configured with Record Types/Categories to target specific Records. Executes the formula logic for each matching Record found by an underlying temporary query.
        *   **On-Demand Formulas:** Primarily used for asynchronous operations. Triggered programmatically from other Formulas or End Points.
        *   **Action Formulas:** Triggered by specific user actions during data entry/editing:
            *   **Pre-Edit:** Runs *before* an Entry is displayed for editing. Useful for setting default values or performing pre-calculations.
            *   **Pre-Save:** Runs *after* the user clicks 'Save' but *before* data is committed to the database. Used for complex validation logic.
            *   **Post-Save:** Runs *after* data has been successfully saved. Commonly used for triggering subsequent calculations, updating related data, or initiating workflows. (Note: The "8 Step Edit Process" documentation link describing the exact order was inaccessible).
            *   **Pre-Delete:** Runs *after* a user initiates deletion but *before* the Entry is removed. Allows for validation to prevent or confirm deletion.

*   **Merge Reports (Contexts):**
    *   Beyond replacing Generic Layouts (Section 4), Merge Reports can run in other contexts:
        *   **Pagelet Merge Report:** Added to various BlueStep pages (not tied to a specific Record/Entry). Primarily used to inject custom JavaScript for page-wide modifications or features.
        *   **Record Nav Merge Report:** Added as a custom tab or section within a Record's navigation menu (alongside Forms). Used to display aggregated data, charts, custom reports, or summaries related to the Record.
        *   **Entry Layout Merge Report:** Replaces the standard display/edit layout for a specific Form's Entry (as mentioned in Section 4).
        *   **Field Merge Report:** Allows embedding Merge Report logic (often JavaScript) within a specific Field area on a *Generic* Layout, offering targeted customization without a full layout replacement.

*   **End Points:**
    *   Enable creating custom APIs within BlueStep.
    *   Triggered by external HTTP requests.
    *   Configuration includes defining the URL path, allowed HTTP Methods (GET, POST, etc.), IP address restrictions (whitelisting/blacklisting), and required permissions.
    *   Can execute script logic (similar to Formulas) to interact with BlueStep data.
    *   Can also trigger asynchronous operations, similar to On-Demand Formulas.

## 6. Key Relationships Summary

```mermaid
graph TD
    subgraph Data Hierarchy
        A[Record (Type and Category)] --> B(Entry);  /* Changed '+' to 'and' */
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
        Relate -- Defines --> G[Formula];
        Relate -- Defines --> H[Endpoint];
    end

    subgraph Usage & Triggers
        E -- Retrieves --> A;
        F -- Displays/Edits --> B;
        F -- Uses Merge Tag for --> D;
        G -- Manipulates --> B;
        UserAction -- Triggers --> G;
        Schedule -- Triggers --> G;
        H -- Triggers --> G;
        HttpRequest -- Triggers --> H;
        H -- Accesses/Manipulates --> B;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#cfc,stroke:#333,stroke-width:2px
    style G fill:#ffc,stroke:#333,stroke-width:2px
    style H fill:#fcc,stroke:#333,stroke-width:2px
```
*(Note: Mermaid syntax appears correct, but external validation may be needed if errors persist).*

## 7. Example Scenario

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
    *   **Fields:** Name (Text), DOB (Date), City (Text), State (Lookup), Zip (Number), Phone (Text), Age (Number - Calculated via Formula)

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

**Explanation & Potential Scripts:**

*   A `Record` with Type=`Person` and Category=`Young Person` would have the `Personal Information` Form and the `School Information` Form applicable.
    *   *Formula Example:* A Post-Save Formula on the `Personal Information` Form could calculate the `Age` field based on the `DOB` field after saving.
*   A `Record` with Type=`Person` and Category=`Old Person` would have the `Personal Information` Form and the `Work Information` Form applicable.
*   A `Record` with Type=`Building` would have the `Building Information` Form and potentially multiple `Entries` of the `Maintenance History` Form.
    *   *Merge Report Example:* A Record Nav Merge Report could be added to `Building` records to display a summary chart of maintenance tasks completed per year, derived from the `Maintenance History` entries.
    *   *Endpoint Example:* An Endpoint could be created to allow an external system to query recent maintenance tasks for a specific building via an HTTP GET request.

## 8. Documentation Links

*   **Main Platform Support:** [https://bluestepplatformsupport.bluestep.net/shared/layouts/singleblock.jsp?_event=view&_id=120130___194606](https://bluestepplatformsupport.bluestep.net/shared/layouts/singleblock.jsp?_event=view&_id=120130___194606)
*   **Relatescript Support Home:** [https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3121](https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3121)
*   **Relatescript Table of Contents:** [https://bluestepplatformsupport.bluestep.net/shared/custompage/contentoutline.jsp?_event=view&_id=445506___3121](https://bluestepplatformsupport.bluestep.net/shared/custompage/contentoutline.jsp?_event=view&_id=445506___3121) (*Note: Link was inaccessible during last check.*)
*   **bsjs Documentation (TypeDoc):** [https://bluestepplatformsupport.bluestep.net/jslib/docs/B/](https://bluestepplatformsupport.bluestep.net/jslib/docs/B/) (*Note: Navigation within this documentation was limited.*)
*   **Relate Components Home:** [https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8181](https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8181)
*   **Compound Form Problem:** [https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8822](https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___8822)
*   **8 Step Edit Process:** [https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3842](https://bluestepplatformsupport.bluestep.net/shared/custompage/custompage.jsp?_event=view&_id=445506___3842) (*Note: Link was inaccessible during last check.*)
*   **General BlueStep Support:** [https://support.bluestep.net/home.jsp](https://support.bluestep.net/home.jsp)

## 9. TODO & Areas for Clarification

*   [ ] Define/Explain Record Navigation structure.
*   [ ] Define/Explain Unit Structure and its relation to Records/Permissions.
*   [ ] Detail the Permissions model (how access to Records, Forms, Fields is controlled).
*   [ ] Describe Site Structure (how different parts of the application are organized for users).
*   [ ] List and describe common Site Components.
*   [ ] Explain Custom Queries (beyond the basic Queries/Reports mentioned).
*   [ ] Provide concrete Script Examples (RelateScript/bsjs) with descriptions for common use cases (e.g., validation, data manipulation, UI changes).
*   [ ] Explain how Script Imports work in both RelateScript and bsjs.
*   [ ] Add example "entry" data to the scenario in Section 7.
*   [ ] Add more detailed "script" scenarios to the example in Section 7.
*   [ ] Provide detailed descriptions for common Field Types (Text, Number, Date, Lookup, Signature, etc.) including their specific configuration options.
*   [ ] Add descriptions for *all* Relate component types listed in Section 3.
*   [ ] Provide a Container Tree Example (if applicable to data structure or UI).
*   [ ] Locate and add link/summary for BlueStep GraphQL Documentation (if available).
*   [ ] Clarify the exact execution environment/context for bsjs scripts (available global objects, limitations).
*   [ ] Explain the difference between Relate Queries and Reports in more detail, especially regarding FE display.
*   [ ] What are "Option Lists" used for and how are they configured?
*   [ ] How does the "Compound Form Problem" relate to the core concepts? Can an example be added?
*   [ ] What is the typical use case for "Pagelet Merge Reports"?
*   [ ] Are there different types of "End Points" or specific configuration patterns?
