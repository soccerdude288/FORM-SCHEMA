This file is a living document. The older information is likely outdated, but may provide additional context.

## 7:00pm
### Context
../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_outputv2.json - These are the current results that are produced
temp_getMAR_API_RESPONSE.json - The results from a GET request to the MAR API
../contextv3.md - Context on BlueStep that may be applicable
5-13-25-AI-Notes.md - Claude generated notes from the previous session

### Problem
In the last session, my Form Schema was heavily refactored and simplified. It's in a place closer to what I'd like, but more changes need to be made.

The `exceptions` field in the latest results points to another API for dynamic options. As of right now, I don't want to call another API to get them, they are just included as part of the MAR GET request. In that request you will see an example of the dynamic exceptions. You will note, each dynamic exception also has rules that control vitals behavior. I need to represent this in the schema.

### Instructions
Create 5-13-25-AI-Notes-v2.md to track any relevant information needed to continue in a new session.

Be mindful of any existing non-schema related functions, as I don't want to impact other parts of the system right now. I will utilize frequent commits to track history, so you can make direct edits to the files.


## 5:00pm
### Context

There are a lot of outdated files, descriptions, summaries, etc. Please try to focus on the files I explicitly mention that contain the most up to date information.

../appApiFiles/* - This whole directory contains the most up to date typescript I'm looking to change
manual-review.md - This contains my manually written description of the problem and what I'm trying to solve
conditionalrequired.bluestep - This contains some of the business rules I'm trying to represent
mardetail.bluestep - This contains more business rules I'm trying to represent
marformgraphqlresults.json - This is a list of fields on the MAR form to reference. Not all of them are required here.
temp_output.json - These are the current results that are produced
../contextv3.md - Context on BlueStep that may be applicable

### Problem

I've iterated through a number of changes to get to the point I'm at. I think the current implementation is capable of representing what I need, but I'm not happy with how complex it's become. I'd like to use it as reference for what I'm generally trying to accomplish, but I'd like to start fresh with a less complex implementation.

As a reminder, these are the main considerations I need to solve
* Provide a definition that can be read by an App to instruct it on how to capture user data
* A list of fields and their properties need to be included
* Dynamic Required Field rules (static rules can be included on the field if that's the best solution)
* Dynamic Hide/Show rules
* Static Option Values
* Dynamic Option Values - I'm open to other ideas, but the applicable options are currently included in the individual entries GET call. So there needs to be a way to indicate these are dynamic and where to find them
* If a field is editable or not


Also keep in mind the MAR schema is just one of many forms I need to do this to. It just happens to be the most complex. Be sure to make everything Generic so it can be applied elsewhere.


### Instructions
Please dont make any changes to existing files in ../appApiFiles/*. Rather create new files in that directory to represent changes. Prefix them with `new-`. Simplicity is key here.

Create 5-13-25-AI-Notes.md to track any relevant information needed to continue in a new session.