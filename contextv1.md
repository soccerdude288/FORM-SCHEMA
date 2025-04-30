BlueStep is a SASS. BlueStep runs on a Java platform.

BlueStep allows Business Users to define "Forms" and "Fields" to store and represent their data.

A "Record Type" defines records. Commonly used types are "Individual", "Facility", or other complex objects that represent a lot of data. Every Record Type has a special form that defines it. This is called the "Record Type Form".

A "Record Category" is a more specific definition for a record. Record Categories are applied to one or many Record Types. Common categories are "Active Client", "Inactive Client", "Main Facility", "Satelite Facility", etc.

A "Form" can be thought of as a Database Table. Forms can be single or multi entry. Forms have to be applied to a Record Type or more specifically a Record Category.

A "Field" can be thought of as a Database Column.

An "Entry" can be thought of as a Database Row.

A "Record" can be thought of as a wrapper for "Entries". It is defined by a combindation of Types and Categories. Based on its Types and Categories and the Relate Configuration, you know the forms that apply to the record and can be viewed, entered, and edited.

"Relate" is the portion of the application where the configuration takes place. Queries, Reports, Forms, Option Lists, Record Types, Record Categories, Formulas, Merge Reports, End Points are all components of Relate that define how BlueStep works.

Relate Queries and Reports serve the same base purpose, but diverge when it comes to FE display. They are configured with Types and Categories. Based on that, you can then add basic search critera based on the applicable forms. Then you can pick what fields are displayed. The important concept to note is each "row" or "result" of the query represents a single record and 1 or many forms, but a specific entry of each form.

A Merge Report ultimately prints content onto the page. This is often a mix of HTML, Javascript, and CSS. Some of it is static, some of it is dynamic in nature.

In BlueStep there is a Generic Layout that can be configured to display an entry on a record. There are basic configurations like... "Require field A", "Show Field B if Field C equals 1", "Field D can't be more than 50 characters".

Sometimes the generic layout is not powerful enough. BlueStep has what is called a "Merge Report" that allows users to code a custom layout. There are two types of Merge Reports. RelateScript and bsjs.

RelateScript is a proprietary scripting language that loosely resembles Javascript, but has a lot of limitations.

bsjs is the successor to RelateScript and allows TypeScript to be written, that is then compiled to Javascript, that is then executed by the Graal Java Library.


When rendering a field on the page, it has to belong to an "entry", which belongs to a "form", which is owned by a "record". The concept that generates the editable field is called a "mergeTag".

A basic configuration could look like the following.

#### Record Types
* Person
* Building

#### Record Categories
* Young Person
* Old Person

#### Forms
* Personal Information
* School Information
* Work Information
* Building Information
* Maintenance History


#### Personal Information Form
##### Configuration
* "Person" Record Type Form
* Single Entry

##### Fields
* Name - Text Field
* DOB - Date Field
* City - Text Field
* State - Text Field (State Lookup)
* Zip - Number Field (with validation)
* Phone - Text Field (phone number validation)

#### School Information Form
##### Configuration
* Only Applies to "Young Person" Record Categories
* Single Entry

##### Fields
* School Name - Text Field

#### Work Information Form
##### Configuration
* Only Applies to "Old Person" Record Categories
##### Fields
* Company Name - Text Field
* Company Size - Number Field


#### Building Information Form
##### Configuration
* "Building" Record Type Form
* Single Entry

##### Fields
* Building Name - Text Field
* Building Capacity - Number Field

#### Maintenance History Form
##### Configuration
* Applies to "Building" Record Type
* Multi-Entry

##### Fields
* Date - Date/Time Field
* Task - Text Fields
* Completed By - Signature Field
