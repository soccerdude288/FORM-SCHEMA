### Files
* contextv3.md - This gives insight to how the BlueStep platform is designed and configured. It should be processed first.
* AI-review.md - This is where I'd like the findings to be recorded. Any questions, assumptions, notes, etc.. should be organized here. Provide any notes, suggestions, * instructions that a future request for a different form could benefit from.
* conditionalrequired.bluestep/mardetail.bluestep - This is the RelateScript for the Merge Reports. Try to understand the syntax and dynamic imports as best as possible. This should be the primary source of what business rules and fields are needed.
* marformgraphqlresults.json - This is a list of fields configured on the MAR form with their fieldIds and types. These should correspond to references in the Merge Reports.
* schemafunctions.ts - This is the typescript file in the bsjs End Point that serves the API. This will be where I define the framework and implement it for different forms.

### Goal
* The primary objective is to take the MAR system configured in BlueStep and translate it into a JSON representation that can be ingested by an App.

* This App needs to know how to properly display a BlueStep form. Given the dynamic nature of BlueStep, the business rules cannot be hard coded.

* The idea is the App will request the "schema" for a given form in the context of the record. Then a separate API call will be made to get existing data if needed.

* The current schemafunctions.ts is mostly a proof of concept. Don't assume anything to be fully correct. There may need to be additions and adjustments to the current Schema definitons.

### Context
* The MAR is a form on Individual - Resident Records. It is a Multi Entry Form. It is complex in nature and uses a lot of advanced concepts.

* The Generic Layout for the form is not used. The "MAR Detail" Merge Report is what gets displayed. That Merge Report also includes the "Conditional Required" Merge Report which primarily generates Javascript to put on the page that enforces different business rules.

* Both Merge Reports have dynamic components to them. Outside the Resident Record there is a Community Record that relates to it. In this Record there are different Setup forms that control different behavior. This dynamic nature needs to be taken into account when designing the Schema Object.

### Manual Review
* Below are considerations I found during my own review of the system. Your findings should closely match what I've found. Please take note of any differences.

#### Business Rule Considerations
* Some Exceptions dynamically require notes, vitals, and "loss of meds"
* Exceptions are dynamic
* Dynamic Medication Effectiveness
* PRN Interval Rules
* Pain Level Tracking (Pre/Post)
* Prep Signature
* No Administartion Rules
* Glucose Sliding Scale
* MAR Prep Sig?
* Vitals required by Med Prescribed
* Sliding Scale required by Med Prescribed
* Meds on Hold
* Show PRN Effectiveness

#### Fields
* Med Name - Read Only
* Mar Instructions - Read Only
* Quantity Admin - Editable
* Quantity Unit - Read Only
* Diagnosis - Read Only
* Notes - Editable
* Exceptions - Editable/Dynamic
* Administration Time - Editable
* Vitals Fields - Editable
* Signature - Editable
