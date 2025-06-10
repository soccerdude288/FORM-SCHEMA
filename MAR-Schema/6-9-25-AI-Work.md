This file is a living document. The older information is likely outdated, but may provide additional context.


## 2:45pm
../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_outputv3.json - These are the current results that are produced from the payload function
temp_getMAR_API_RESPONSE.json - The results from a GET request to the MAR API
../contextv3.md - Context on BlueStep that may be applicable
5-13-25-AI-Notes.md - Claude generated notes from the previous session. These are likely out to date as I've made manual modifications since.
6-9-25-AI-Notes.md - Claude generated notes from earlier today. I'd like to keep these updated.

### Questions
* Why do BPD and BPS have dynamicField and dynamicMapping when the other vitals don't?
* Would it make sense creating an array of tags to apply to fields that will group that field into an action? For example, tag all vitals, tag all fields that should be read-only after signed, etc.
* I don't know why we are including `dynamicValues` on the schema itself. I want it to be documented and implied that dynamic values come from the entries specific payload. I don't think there is any reason to have that in the schema.
* I'm still confused why references to the vitals field in the context of the schema are preferenced with `vitals.`. That should only be used to tell the implementor where to get the value from in the GET payload. References to the field in the schema should just use the field id I'd think.

## 1:30pm
### Context
../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_outputv3.json - These are the current results that are produced from the payload function
temp_getMAR_API_RESPONSE.json - The results from a GET request to the MAR API
../contextv3.md - Context on BlueStep that may be applicable
5-13-25-AI-Notes.md - Claude generated notes from the previous session. These are likely out to date as I've made manual modifications since.
6-9-25-AI-Notes.md - Claude generated notes from earlier today. I'd like to keep these updated.

### Problem

I'm still not confident what we have is fully thought through. Please take a minute to review, find any logical inconsistencies, any potential holes in behavior. Once you've done that, I'll review your findings and direct from there.

Also review @../SCHEMA-DOCS.md and make sure they are correct for the current state of things.


### Instructions
Please keep changes directly related to the items I've specifified. I don't want any unrelated behavior to change.

Keep 6-9-25-AI-Notes.md up to date to track any relevant information needed to continue in a new session.

## 12:00pm

### Context
../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_outputv3.json - These are the current results that are produced from the payload function
temp_getMAR_API_RESPONSE.json - The results from a GET request to the MAR API
../contextv3.md - Context on BlueStep that may be applicable
5-13-25-AI-Notes.md - Claude generated notes from the previous session. These are likely out to date as I've made manual modifications since.

### Problem
The ../appApiFiles/schemas/formSchemaInterface.ts has been manually adjusted by me to some degree to add things I needed. There is more work to be done here.

../appApiFiles/schemas/marSchema.ts has been manually adjusted to attempt to reflect what I need to accomplish, but those changes need to be refined and then supported in the Interfaces file.

One of the main problems is multi step rules. For example the vitals are more complex than can currently be reflected.

* The MAR payload will return a new property called dynamicValues. That's going to represent anything that is dynamic to this entry that controls the schema. In this case the `dynamicValues.whatVitals` will be an array of the vitals that apply to this specific entry.
* Those values need to be mapped to the actual property that is used in the payload and in the schema. I've attempted this, but it could be reviewed and enhanced.
* Then there are conditional required rules that will only apply to the vitals that are valid for this entry, but I need to define all possible rules in the schema.

Another problem is how to represent the Sliding Scale.
* Sliding scale data can be found in `dynamicValues.slidingScale`. This object defines the rules for what dosage is suggested based on the glucose number. `slidingScale.start` defines ranges that correlate to the index of `slidingScale.doses`. Based on that calculation we have to show a read only value.
* I think there maybe needs to be a type of field that just represents a calculated value, or a placeholder for a calculated value.
* The sliding scale is a very specific situation, and likely might just be specific to the MAR rather than generically for other Form Schemas. Keep that in mind if there is a good way to make this generic.

Need to make sure there is a way to define a Rule for what is no longer editable if a signature comes back as signed in the payload.


### Changes to documentation
../SCHEMA-DOCS.md needs to be updated to reflect the changes that are made. 

It also need to explain that signature fields are not editable after they've been entered, and they are to just be displayed as the timestamp that is returned in the payload.



### Instructions
Please keep changes directly related to the items I've specifified. I don't want any unrelated behavior to change.

Create 6-9-25-AI-Notes.md to track any relevant information needed to continue in a new session.


